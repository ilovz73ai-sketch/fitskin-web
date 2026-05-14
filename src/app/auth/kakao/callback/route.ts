import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/?auth_error=no_code`);
  }

  const restApiKey = process.env.KAKAO_REST_API_KEY;
  if (!restApiKey) {
    return NextResponse.redirect(`${origin}/?auth_error=no_api_key`);
  }

  const redirectUri = `${origin}/auth/kakao/callback`;

  // 1. 코드 → 토큰
  let tokenData: Record<string, unknown>;
  try {
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: restApiKey,
        ...(process.env.KAKAO_CLIENT_SECRET ? { client_secret: process.env.KAKAO_CLIENT_SECRET } : {}),
        redirect_uri: redirectUri,
        code,
      }),
    });
    tokenData = await tokenRes.json();
  } catch (e) {
    return NextResponse.redirect(`${origin}/?auth_error=token_fetch_failed`);
  }

  if (!tokenData.access_token) {
    const errCode = encodeURIComponent(String(tokenData.error ?? 'unknown'));
    const errDesc = encodeURIComponent(String(tokenData.error_description ?? ''));
    return NextResponse.redirect(`${origin}/?auth_error=token_fail&ec=${errCode}&ed=${errDesc}`);
  }

  const access_token = tokenData.access_token as string;

  // 2. 사용자 정보
  let kakaoUser: Record<string, unknown>;
  try {
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    kakaoUser = await userRes.json();
  } catch {
    return NextResponse.redirect(`${origin}/?auth_error=user_fetch_failed`);
  }

  const kakaoId = String(kakaoUser.id);
  const account = kakaoUser.kakao_account as Record<string, unknown> | undefined;
  const profile = account?.profile as Record<string, unknown> | undefined;
  const nickname = (profile?.nickname as string) ?? '사용자';
  const email = (account?.email as string) ?? null;
  const avatarUrl = (profile?.thumbnail_image_url as string) ?? null;

  const userObj = { id: kakaoId, display_name: nickname, email, avatar_url: avatarUrl };
  const userJson = encodeURIComponent(JSON.stringify(userObj));

  return NextResponse.redirect(`${origin}/?login=${userJson}`);
}
