export interface FsUser {
  id: string;
  display_name: string;
  email: string | null;
  avatar_url: string | null;
}

const STORAGE_KEY = 'fs_user';

export function getStoredUser(): FsUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}

export function saveUser(user: FsUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function signOut() {
  localStorage.removeItem(STORAGE_KEY);
}

export function kakaoLoginUrl(): string {
  const restApiKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!;
  const redirectUri = `${window.location.origin}/auth/kakao/callback`;
  return `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${restApiKey}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}
