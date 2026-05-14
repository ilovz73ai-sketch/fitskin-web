import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get('code');

  if (!code) return NextResponse.redirect(`${origin}/`);

  const restApiKey = process.env.KAKAO_REST_API_KEY!;
  const redirectUri = `${origin}/auth/kakao/callback`;

  // 1. 코드 → 토큰
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
    if (!tokenData.access_token) {
      console.error('Token error:', JSON.stringify(tokenData));
      return NextResponse.redirect(`${origin}/?auth_error=token`);
    }
    access_token = tokenData.access_token;
  } catch (e) {
    console.error('Token fetch error:', e);
    return NextResponse.redirect(`${origin}/?auth_error=fetch`);
  }

  // 2. 카카오 사용자 정보
  let kakaoUser: Record<string, unknown>;
  try {
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    kakaoUser = await userRes.json();
  } catch {
    return NextResponse.redirect(`${origin}/?auth_error=user`);
  }

  const kakaoId = String(kakaoUser.id);
  const account = kakaoUser.kakao_account as Record<string, unknown> | undefined;
  const profile = account?.profile as Record<string, unknown> | undefined;
  const nickname = (profile?.nickname as string) ?? '사용자';
  const email = (account?.email as string) ?? null;
  const avatarUrl = (profile?.thumbnail_image_url as string) ?? null;

  const userObj = { id: kakaoId, display_name: nickname, email, avatar_url: avatarUrl };

  // 3. URL 파라미터로 전달 (쿠키 대신)
  const encoded = Buffer.from(JSON.stringify(userObj)).toString('base64');
  return NextResponse.redirect(`${origin}/?login=${encodeURIComponent(encoded)}`);
}
