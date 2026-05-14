import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get('code');

  if (!code) return NextResponse.redirect(`${origin}/`);

  const restApiKey = process.env.KAKAO_REST_API_KEY!;
  const redirectUri = `${origin}/auth/kakao/callback`;

  // 1. 코드 → 토큰 교환
  let access_token: string;
  try {
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: restApiKey,
        redirect_uri: redirectUri,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('no token');
    access_token = tokenData.access_token;
  } catch {
    return NextResponse.redirect(`${origin}/`);
  }

  // 2. 카카오 사용자 정보
  let kakaoUser: Record<string, unknown>;
  try {
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    kakaoUser = await userRes.json();
  } catch {
    return NextResponse.redirect(`${origin}/`);
  }

  const kakaoId = String(kakaoUser.id);
  const account = kakaoUser.kakao_account as Record<string, unknown> | undefined;
  const profile = account?.profile as Record<string, unknown> | undefined;
  const nickname = (profile?.nickname as string) ?? '사용자';
  const email = (account?.email as string) ?? null;
  const avatarUrl = (profile?.thumbnail_image_url as string) ?? null;

  // 3. 쿠키에 저장할 user 객체 (DB 결과 기다리지 않음)
  const userObj = { id: kakaoId, display_name: nickname, email, avatar_url: avatarUrl };

  // 4. DB 저장 (실패해도 로그인은 진행)
  try {
    const db = createServerClient();
    const { data: existing } = await db
      .from('profiles')
      .select('id')
      .eq('kakao_id', kakaoId)
      .single();

    if (existing) {
      Object.assign(userObj, { id: existing.id });
      await db.from('profiles').update({ display_name: nickname, email, avatar_url: avatarUrl, updated_at: new Date().toISOString() }).eq('kakao_id', kakaoId);
    } else {
      const { data: inserted } = await db.from('profiles').insert({ kakao_id: kakaoId, display_name: nickname, email, avatar_url: avatarUrl }).select('id').single();
      if (inserted) Object.assign(userObj, { id: inserted.id });
    }
  } catch {
    // profiles 테이블 없어도 로그인은 정상 동작
  }

  // 5. 쿠키 세팅 후 홈으로 이동
  const res = NextResponse.redirect(`${origin}/`);
  res.cookies.set('fs_user', encodeURIComponent(JSON.stringify(userObj)), {
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    secure: true,
  });
  return res;
}
