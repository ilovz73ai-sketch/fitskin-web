'use client';
import { useState, useEffect } from 'react';
import { SERIES, TODAY_IDX, TODAY_SCORE, YDAY_SCORE, WEEK_AGO_SCORE } from '@/lib/data';
import { Icon } from '../primitives/icons';
import { ScoreRing } from '../primitives/ScoreRing';
import { Sparkline } from '../primitives/Sparkline';
import type { FsUser } from '@/lib/auth';

interface Measurement {
  id: string;
  created_at: string;
  composite_score: number;
  scores: Record<string, number>;
  summary: string | null;
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

function todayLabel() {
  const d = new Date();
  return `${DAYS[d.getDay()]}요일 · ${MONTHS[d.getMonth()]} ${d.getDate()}일`;
}

export function ScreenHome({ onCapture, onNav, user }: {
  onCapture: () => void;
  onNav: (s: string) => void;
  user?: FsUser | null;
}) {
  const [latest, setLatest] = useState<Measurement | null>(null);
  const [prev, setPrev] = useState<Measurement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/measurements?userId=${user.id}`)
      .then(r => r.json())
      .then((data: Measurement[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setLatest(data[0]);
          if (data.length > 1) setPrev(data[1]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const todayScore = latest?.composite_score ?? TODAY_SCORE;
  const prevScore = prev?.composite_score ?? YDAY_SCORE;
  const todayDelta = todayScore - prevScore;
  const weekDelta = todayScore - WEEK_AGO_SCORE;

  // SERIES mock 키 → Gemini/DB API 키 매핑
  // SERIES: acne, redness, pigment, wrinkle, pore, oil, hydra, tone, texture, firm
  // DB/API: acne, redness, pigmentation, wrinkles, pores, oiliness, hydration, evenness, texture, elasticity
  const SERIES_TO_API: Record<string, string> = {
    acne: 'acne',
    redness: 'redness',
    pigment: 'pigmentation',
    wrinkle: 'wrinkles',
    pore: 'pores',
    oil: 'oiliness',
    hydra: 'hydration',
    tone: 'evenness',
    texture: 'texture',
    firm: 'elasticity',
  };

  const top3 = [...SERIES].sort((a, b) => {
    const da = (a.values[TODAY_IDX] - a.values[TODAY_IDX - 7]) * (a.good === 'high' ? 1 : -1);
    const db = (b.values[TODAY_IDX] - b.values[TODAY_IDX - 7]) * (b.good === 'high' ? 1 : -1);
    return db - da;
  }).slice(0, 3);

  // display_name이 기본값('사용자')이면 이메일 앞부분으로 대체
  const rawName = user?.display_name ?? '';
  const resolvedName =
    rawName && rawName !== '사용자' && rawName !== 'user'
      ? rawName.split(' ')[0]
      : user?.email
        ? user.email.split('@')[0]
        : '게스트';
  const firstName = resolvedName;

  const lastMeasuredLabel = latest
    ? (() => {
        const d = new Date(latest.created_at);
        const diff = Math.floor((Date.now() - d.getTime()) / 60000);
        if (diff < 60) return `방금 전`;
        if (diff < 60 * 24) return `오늘 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        return `어제`;
      })()
    : '아직 측정 없음';

  return (
    <div className="fs-app fs-fade-in" style={{ background: 'var(--fs-bg)', minHeight: '100%' }}>
      <div style={{ padding: '70px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="fs-eyebrow">{todayLabel()}</div>
            <div className="fs-h1" style={{ marginTop: 4 }}>안녕, {firstName}.</div>
          </div>
          <div className="fs-streak">
            {Icon.flame('#8a4a18')}<span>14일</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <div className="fs-card fs-grain" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
          <div className="fs-eyebrow" style={{ marginBottom: 10 }}>오늘의 컴포짓 스코어</div>
          {loading ? (
            <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color: 'var(--fs-ink-3)', letterSpacing: '0.1em' }}>불러오는 중…</div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
              <ScoreRing score={todayScore} delta={todayDelta} size={120}/>
              <div style={{ flex: 1 }}>
                {latest ? (
                  <div className="fs-body" style={{ color: 'var(--fs-ink)', fontSize: 14, lineHeight: 1.45 }}>
                    {latest.summary ?? `지난 7일 동안 ${weekDelta >= 0 ? '+' : ''}${weekDelta}점 변화.`}
                  </div>
                ) : (
                  <div className="fs-body" style={{ color: 'var(--fs-ink)', fontSize: 14, lineHeight: 1.45 }}>
                    아직 측정 기록이 없어요.<br/>지금 바로 첫 측정을 시작해보세요.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <button className="fs-btn fs-btn-coral fs-btn-block" onClick={onCapture} style={{ height: 56, fontSize: 16 }}>
          {Icon.camera('#fff')}<span>지금 측정하기 · 25초</span>
        </button>
        <div className="fs-caption" style={{ textAlign: 'center', marginTop: 8 }}>마지막 측정 {lastMeasuredLabel}</div>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="fs-h2">이번 주 변화</div>
          <button onClick={() => onNav('trend')} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--fs-ink-3)', fontSize: 13, fontWeight: 500 }}>
            전체 보기 {Icon.chevron('#8A847A')}
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {top3.map(d => {
            const apiKey = SERIES_TO_API[d.key] ?? d.key;
            const score = latest?.scores ? (latest.scores[apiKey] ?? d.values[TODAY_IDX]) : d.values[TODAY_IDX];
            const prevVal = prev?.scores ? (prev.scores[apiKey] ?? d.values[TODAY_IDX - 1]) : d.values[TODAY_IDX - 1];
            const delta = Math.round(score - prevVal);
            const better = d.good === 'high' ? delta > 0 : delta < 0;
            return (
              <div key={d.key} className="fs-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: d.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: d.color, fontFamily: 'Newsreader, serif', fontSize: 18, fontWeight: 600 }}>
                  {Math.round(score)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{d.label}</div>
                  <div className="fs-caption" style={{ marginTop: 2 }}>직전 측정 대비 {delta > 0 ? '+' : ''}{delta} · {delta === 0 ? '유지' : better ? '개선' : '주의'}</div>
                </div>
                <Sparkline values={d.values.slice(-14)} color={d.color} width={60} height={22}/>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <div className="fs-card-flat" style={{ padding: 18, borderLeft: '3px solid #7FB8A8' }}>
          <div className="fs-eyebrow" style={{ color: '#2F7A66', marginBottom: 6 }}>매칭된 효과</div>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: 18, lineHeight: 1.3, fontWeight: 500 }}>
            &quot;센텔라 시카 세럼&quot; 사용 23일째,<br/>여드름 지표 <span style={{ color: '#2F7A66' }}>−18%</span> 감소.
          </div>
          <div className="fs-caption" style={{ marginTop: 10 }}>통계적 신뢰도 92% · 외부 요인(수면, 식단) 미보정</div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <div className="fs-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div className="fs-eyebrow" style={{ color: 'var(--fs-coral-ink)' }}>FITSKIN PLUS · AI TOP 10</div>
              <div style={{ fontFamily: 'Newsreader, serif', fontSize: 17, fontWeight: 500, marginTop: 2 }}>{firstName} 피부에 맞는 추천</div>
            </div>
            <span className="fs-pill fs-pill-coral">−15% 특가</span>
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 4px' }}>
            {['닥터지 시카', '라네즈 토너', '에스트라 365', '셀퓨전씨'].map((p, i) => (
              <div key={i} style={{ minWidth: 96, flexShrink: 0 }}>
                <div style={{ width: 96, height: 110, borderRadius: 10, background: ['#F8E8DD','#E0EFEA','#F4E0D6','#FBE4DC'][i], display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8, fontFamily: 'Newsreader, serif', fontSize: 10, color: '#8C5938', letterSpacing: '0.06em' }}>
                  {p}
                </div>
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--fs-ink-3)' }}>매칭 9{4-i}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 20px 28px' }}>
        <div className="fs-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F7EAC9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Newsreader, serif', fontWeight: 500, color: '#8a4a18' }}>
            +50p
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>오늘 측정으로 50p 적립</div>
            <div className="fs-caption" style={{ marginTop: 2 }}>스킨 포인트 · 샘플 교환 가능</div>
          </div>
          {Icon.chevron('#8A847A')}
        </div>
      </div>
    </div>
  );
}
