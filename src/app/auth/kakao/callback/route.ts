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
  } catch {
    return NextResponse.redirect(`${origin}/?auth_error=token_fetch_failed`);
  }

  if (!tokenData.access_token) {
    const errCode = encodeURIComponent(String(tokenData.error ?? 'unknown'));
    const errDesc = encodeURIComponent(String(tokenData.error_description ?? ''));
    return NextResponse.redirect(`${origin}/?auth_error=token_fail&ec=${errCode}&ed=${errDesc}`);
  }

  const access_token = tokenData.access_token as string;

  // 2. 사용자 정보 (property_keys로 필요한 항목만 명시)
  let kakaoUser: Record<string, unknown>;
  try {
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        property_keys: JSON.stringify([
          'kakao_account.profile',
          'kakao_account.email',
        ]),
      }),
    });
    kakaoUser = await userRes.json();
  } catch {
    return NextResponse.redirect(`${origin}/?auth_error=user_fetch_failed`);
  }

  const kakaoId = String(kakaoUser.id);
  const account = kakaoUser.kakao_account as Record<string, unknown> | undefined;
  const profile = account?.profile as Record<string, unknown> | undefined;

  // 닉네임 우선순위: profile.nickname → email 앞부분 → id 마지막 6자리
  const rawNickname = (profile?.nickname as string | undefined)?.trim();
  const email = (account?.email as string) ?? null;

  let display_name: string;
  if (rawNickname && rawNickname !== '사용자' && rawNickname !== 'user' && rawNickname.length > 0) {
    display_name = rawNickname;
  } else if (email) {
    display_name = email.split('@')[0];
  } else {
    display_name = `user_${kakaoId.slice(-6)}`;
  }

  const avatarUrl =
    (profile?.profile_image_url as string) ??
    (profile?.thumbnail_image_url as string) ??
    null;

  const userObj = { id: kakaoId, display_name, email, avatar_url: avatarUrl };
  const userJson = encodeURIComponent(JSON.stringify(userObj));

  return NextResponse.redirect(`${origin}/?login=${userJson}`);
}
