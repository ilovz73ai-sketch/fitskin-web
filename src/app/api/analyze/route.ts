import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// 모델 우선순위 — 실패 시 순서대로 fallback
const MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
];
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Gemini REST API: 타입명은 대문자 (OBJECT, STRING, NUMBER, ARRAY)
const SCHEMA = {
  type: 'OBJECT',
  properties: {
    scores: {
      type: 'OBJECT',
      properties: {
        acne:         { type: 'NUMBER' },
        redness:      { type: 'NUMBER' },
        pigmentation: { type: 'NUMBER' },
        wrinkles:     { type: 'NUMBER' },
        pores:        { type: 'NUMBER' },
        oiliness:     { type: 'NUMBER' },
        hydration:    { type: 'NUMBER' },
        evenness:     { type: 'NUMBER' },
        texture:      { type: 'NUMBER' },
        elasticity:   { type: 'NUMBER' },
      },
    },
    summary:     { type: 'STRING' },
    highlights:  { type: 'ARRAY', items: { type: 'STRING' } },
    suggestions: { type: 'ARRAY', items: { type: 'STRING' } },
  },
};

const PROMPT =
  `당신은 피부 분석 전문가 AI입니다. 얼굴 사진을 보고 10가지 지표를 0~100 정수로 평가하세요 (높을수록 좋음).\n` +
  `acne(여드름없음), redness(홍반없음), pigmentation(색소침착없음), wrinkles(주름없음), pores(모공정돈), ` +
  `oiliness(유분균형), hydration(수분감), evenness(피부톤균일), texture(피부결), elasticity(탄력).\n` +
  `summary 20자이내, highlights 잘관리된점 2개, suggestions 개선제안 2개.`;

type Analysis = {
  scores: Record<string, number>;
  summary: string;
  highlights: string[];
  suggestions: string[];
};

async function callGemini(
  apiKey: string,
  model: string,
  mimeType: string,
  imageBase64: string,
  useSchema: boolean,
): Promise<{ ok: true; data: Analysis } | { ok: false; status: number; error: string }> {
  const url = `${BASE}/${model}:generateContent?key=${apiKey}`;
  const genConfig: Record<string, unknown> = { temperature: 0.2, maxOutputTokens: 1024 };
  if (useSchema) {
    genConfig.responseMimeType = 'application/json';
    genConfig.responseSchema = SCHEMA;
  }

  const promptText = useSchema
    ? PROMPT
    : PROMPT + '\n\n반드시 JSON만 출력: {"scores":{...},"summary":"...","highlights":[...],"suggestions":[...]}';

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: promptText },
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
          ],
        }],
        generationConfig: genConfig,
      }),
    });
  } catch (e) {
    return { ok: false, status: 0, error: `네트워크 오류: ${String(e)}` };
  }

  const body = await res.json();
  if (!res.ok) {
    const msg = body?.error?.message ?? body?.error ?? JSON.stringify(body).slice(0, 200);
    return { ok: false, status: res.status, error: `${model} HTTP ${res.status}: ${msg}` };
  }

  const text: string = body.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) {
    return { ok: false, status: 200, error: `${model}: 빈 응답 body=${JSON.stringify(body).slice(0, 200)}` };
  }

  try {
    const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/,'').trim();
    const jsonStr = clean.startsWith('{') ? clean : (clean.match(/\{[\s\S]*\}/) ?? [''])[0];
    const parsed: Analysis = JSON.parse(jsonStr);
    if (!parsed.scores || typeof parsed.scores !== 'object') throw new Error('scores 없음');
    return { ok: true, data: parsed };
  } catch (e) {
    return { ok: false, status: 200, error: `${model} JSON 파싱 실패: ${String(e)} text=${text.slice(0, 100)}` };
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY 환경변수 없음' }, { status: 503 });
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
  const errors: string[] = [];
  let analysis: Analysis | null = null;

  // 각 모델 × (schema 있음/없음) 순서로 시도
  outer: for (const model of MODELS) {
    for (const useSchema of [true, false]) {
      console.log(`[Gemini] 시도 model=${model} schema=${useSchema}`);
      const result = await callGemini(apiKey, model, mimeType, imageBase64, useSchema);
      if (result.ok) {
        analysis = result.data;
        console.log(`[Gemini] 성공 model=${model} schema=${useSchema} composite=`,
          Math.round(Object.values(analysis.scores).reduce((a, b) => a + b, 0) / 10));
        break outer;
      } else {
        const err = `[${model}/schema=${useSchema}] ${result.error}`;
        errors.push(err);
        console.error('[Gemini]', err);
      }
    }
  }

  if (!analysis) {
    return NextResponse.json(
      { error: `AI 분석 실패 (모든 모델 시도)`, details: errors },
      { status: 502 }
    );
  }

  // 점수 클램프 (0~100 정수)
  for (const k of Object.keys(analysis.scores)) {
    analysis.scores[k] = Math.round(Math.max(0, Math.min(100, Number(analysis.scores[k]) || 50)));
  }
  const composite = Math.round(
    Object.values(analysis.scores).reduce((a, b) => a + b, 0) / Object.values(analysis.scores).length
  );

  // DB 저장
  if (userId) {
    try {
      const db = createServerClient();
      const { error: dbError } = await db.from('measurements').insert({
        user_id: userId,
        scores: analysis.scores,
        composite_score: composite,
        summary: analysis.summary,
        highlights: analysis.highlights ?? [],
        suggestions: analysis.suggestions ?? [],
      });
      if (dbError) console.error('[DB] insert error:', dbError.message);
      else console.log('[DB] 저장 userId=', userId, 'composite=', composite);
    } catch (e) {
      console.error('[DB] unexpected:', e);
    }
  }

  return NextResponse.json(analysis);
}
