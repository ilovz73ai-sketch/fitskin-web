import { NextResponse } from 'next/server';

// GET /api/test-gemini — Gemini API 연결 진단 (브라우저에서 직접 접근 가능)
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'GEMINI_API_KEY 환경변수 없음' });
  }

  const results: Record<string, unknown> = {
    key_prefix: apiKey.slice(0, 10) + '...',
  };

  // 테스트 1: gemini-2.0-flash 텍스트 전용
  try {
    const r1 = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: '숫자 42를 JSON으로 반환: {"answer": 42}' }] }],
          generationConfig: { maxOutputTokens: 50 },
        }),
      }
    );
    const d1 = await r1.json();
    results['gemini-2.0-flash'] = {
      status: r1.status,
      ok: r1.ok,
      text: d1.candidates?.[0]?.content?.parts?.[0]?.text ?? null,
      error: d1.error ?? null,
    };
  } catch (e) {
    results['gemini-2.0-flash'] = { error: String(e) };
  }

  // 테스트 2: gemini-1.5-flash 텍스트 전용
  try {
    const r2 = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: '숫자 42를 JSON으로 반환: {"answer": 42}' }] }],
          generationConfig: { maxOutputTokens: 50 },
        }),
      }
    );
    const d2 = await r2.json();
    results['gemini-1.5-flash'] = {
      status: r2.status,
      ok: r2.ok,
      text: d2.candidates?.[0]?.content?.parts?.[0]?.text ?? null,
      error: d2.error ?? null,
    };
  } catch (e) {
    results['gemini-1.5-flash'] = { error: String(e) };
  }

  // 테스트 3: 모델 목록 조회
  try {
    const r3 = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const d3 = await r3.json();
    results['models_list'] = {
      status: r3.status,
      ok: r3.ok,
      count: d3.models?.length ?? 0,
      error: d3.error ?? null,
      sample: d3.models?.slice(0, 3).map((m: Record<string, unknown>) => m.name) ?? [],
    };
  } catch (e) {
    results['models_list'] = { error: String(e) };
  }

  return NextResponse.json(results, { headers: { 'Cache-Control': 'no-store' } });
}
