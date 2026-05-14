import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const db = createServerClient();
  const { data, error } = await db
    .from('measurements')
    .select('id, created_at, scores, composite_score, summary')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const db = createServerClient();
  const body = await req.json();
  const { userId, scores, compositeScore, summary, highlights, suggestions } = body;

  if (!userId || !scores) return NextResponse.json({ error: 'userId and scores required' }, { status: 400 });

  const { data, error } = await db
    .from('measurements')
    .insert({
      user_id: userId,
      scores,
      composite_score: compositeScore,
      summary,
      highlights,
      suggestions,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
