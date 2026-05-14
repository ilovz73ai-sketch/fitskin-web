import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// POST /api/profile — 로그인 시 사용자 프로필 upsert
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { id, display_name, email, avatar_url } = body as {
    id?: string;
    display_name?: string;
    email?: string | null;
    avatar_url?: string | null;
  };

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const db = createServerClient();
  const { error } = await db.from('profiles').upsert(
    { id, display_name, email, avatar_url, updated_at: new Date().toISOString() },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('[Profile] upsert error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// GET /api/profile?userId=xxx — 프로필 조회
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const db = createServerClient();
  const { data, error } = await db
    .from('profiles')
    .select('id, display_name, email, avatar_url, created_at')
    .eq('id', userId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
