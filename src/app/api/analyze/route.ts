import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SKIN_ANALYSIS_PROMPT = `당신은 피부과 전문의 수준의 피부 분석 AI입니다. 제공된 얼굴 사진을 분석하여 10가지 피부 지표를 0~100 사이의 수치로 평가해주세요.

중요: 이 앱은 의료 진단이 아닌 일상적 피부 관리 참고용입니다. 사용자에게 친절하고 긍정적인 방향으로 피드백을 제공하세요.

분석 항목 (점수가 높을수록 좋음):
- acne: 여드름/트러블 없음 정도 (100 = 완전히 깨끗, 0 = 심한 여드름)
- redness: 홍반/홍조 없음 정도 (100 = 균일한 피부톤, 0 = 심한 홍반)
- pigmentation: 색소침착 없음 정도 (100 = 균일한 색소, 0 = 심한 기미/잡티)
- wrinkles: 잔주름 없음 정도 (100 = 매끈함, 0 = 두드러진 주름)
- pores: 모공 정돈 정도 (100 = 모공 거의 안 보임, 0 = 매우 큰 모공)
- oiliness: 유분 균형 (100 = 적절한 유분, 0 = 과도한 유분/번들거림)
- hydration: 수분감 (사진 기반 추정, 100 = 촉촉, 0 = 건조)
- evenness: 피부톤 균일도 (100 = 균일, 0 = 불균일)
- texture: 피부결 부드러움 (100 = 매끈, 0 = 거친 결)
- elasticity: 탄력 (사진 기반 추정, 100 = 탱탱함, 0 = 처짐)

응답은 반드시 아래 JSON 형식으로만 답해주세요. 다른 텍스트는 포함하지 마세요:
{
  "scores": {
    "acne": 75,
    "redness": 80,
    "pigmentation": 70,
    "wrinkles": 85,
    "pores": 65,
    "oiliness": 75,
    "hydration": 70,
    "evenness": 78,
    "texture": 72,
    "elasticity": 80
  },
  "summary": "피부 상태 전반적 한 줄 요약",
  "highlights": ["잘 관리된 점 1", "잘 관리된 점 2"],
  "suggestions": ["개선 제안 1", "개선 제안 2"]
}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 503 });
  }

  let imageBase64: string;
  let userId: string | null = null;

  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    userId = body.userId ?? null;
    if (!imageBase64) throw new Error('imageBase64 required');
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const mimeType = imageBase64.startsWith('/9j/') ? 'image/jpeg' : 'image/png';

  let analysis: {
    scores: Record<string, number>;
    summary: string;
    highlights: string[];
    suggestions: string[];
  };

  try {
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: SKIN_ANALYSIS_PROMPT },
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
          ],
        }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error('Gemini error:', err);
      return NextResponse.json({ error: 'AI analysis failed' }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in Gemini response');
    analysis = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('Gemini parse error:', e);
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 });
  }

  // DB 저장 (userId 있을 때만)
  if (userId) {
    try {
      const db = createServerClient();
      const composite = Math.round(
        Object.values(analysis.scores).reduce((a, b) => a + b, 0) / Object.values(analysis.scores).length
      );
      await db.from('measurements').insert({
        user_id: userId,
        scores: analysis.scores,
        composite_score: composite,
        summary: analysis.summary,
        highlights: analysis.highlights,
        suggestions: analysis.suggestions,
      });
    } catch (e) {
      console.error('DB save error (non-fatal):', e);
    }
  }

  return NextResponse.json(analysis);
}
