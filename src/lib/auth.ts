export interface FsUser {
  id: string;
  display_name: string;
  email: string | null;
  avatar_url: string | null;
}

export function getStoredUser(): FsUser | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/fs_user=([^;]+)/);
  if (!match) return null;
  try { return JSON.parse(decodeURIComponent(match[1])); } catch { return null; }
}

export function signOut() {
  document.cookie = 'fs_user=; Max-Age=0; path=/';
}

export function kakaoLoginUrl(): string {
  const restApiKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!;
  const redirectUri = `${window.location.origin}/auth/kakao/callback`;
  return `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${restApiKey}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}
