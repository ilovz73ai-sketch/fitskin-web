import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// 카카오 인가 코드 → 액세스 토큰 교환 → 사용자 정보 → profiles upsert → 쿠키 저장
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get('code');

  if (!code) return NextResponse.redirect(`${origin}/?auth_error=no_code`);

  const restApiKey = process.env.KAKAO_REST_API_KEY!;
  const redirectUri = `${origin}/auth/kakao/callback`;

  // 1. 코드 → 토큰 교환
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
  if (!tokenRes.ok) return NextResponse.redirect(`${origin}/?auth_error=token_fail`);
  const { access_token } = await tokenRes.json();

  // 2. 사용자 정보 조회
  const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!userRes.ok) return NextResponse.redirect(`${origin}/?auth_error=user_fail`);
  const kakaoUser = await userRes.json();

  const kakaoId = String(kakaoUser.id);
  const nickname = kakaoUser.kakao_account?.profile?.nickname ?? '사용자';
  const email = kakaoUser.kakao_account?.email ?? null;
  const avatarUrl = kakaoUser.kakao_account?.profile?.thumbnail_image_url ?? null;

  // 3. Supabase profiles 테이블 upsert
  const db = createServerClient();
  await db.from('profiles').upsert({
    kakao_id: kakaoId,
    display_name: nickname,
    email,
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'kakao_id' });

  const { data: profile } = await db
    .from('profiles')
    .select('id, display_name, email, avatar_url')
    .eq('kakao_id', kakaoId)
    .single();

  // 4. 쿠키에 사용자 정보 저장 (7일)
  const res = NextResponse.redirect(`${origin}/`);
  res.cookies.set('fs_user', JSON.stringify(profile), {
    httpOnly: false,   // 클라이언트에서 읽어야 하므로 false
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}
