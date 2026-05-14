'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { SERIES, ROUTINE, TODAY_IDX, TODAY_SCORE, compositeScore } from '@/lib/data';
import { Icon } from '../primitives/icons';
import { FacePlaceholder } from '../primitives/FacePlaceholder';
import type { FsUser } from '@/lib/auth';

const W = 320, H = 160, PT = 16, PB = 28, PL = 28, PR = 8;

interface MeasurementRecord {
  id: string;
  created_at: string;
  composite_score: number;
  scores: Record<string, number>;
  summary: string | null;
}

function BeforeAfter({ pos, onChange }: { pos: number; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: PointerEvent | React.PointerEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    onChange(Math.max(0, Math.min(1, x / rect.width)));
  }, [onChange]);
  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onMove(e);
    const m = (e2: PointerEvent) => onMove(e2);
    const u = () => { window.removeEventListener('pointermove', m); window.removeEventListener('pointerup', u); };
    window.addEventListener('pointermove', m); window.addEventListener('pointerup', u);
  };
  return (
    <div ref={ref} className="fs-ba" style={{ aspectRatio: '4/5' }} onPointerDown={onDown}>
      <div style={{ position: 'absolute', inset: 0 }}><FacePlaceholder width="100%" height="100%" hue="mint" idx={11}/></div>
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${(1 - pos) * 100}% 0 0)` }}><FacePlaceholder width="100%" height="100%" hue="coral" idx={3}/></div>
      <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em' }}>BEFORE</div>
      <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em' }}>AFTER</div>
      <div className="fs-ba-handle" style={{ left: `${pos * 100}%` }}>
        <div className="fs-ba-knob">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B1A17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg>
        </div>
      </div>
    </div>
  );
}

// 실제 측정 기록으로 SVG 차트 그리기
function RealChart({
  records,
  color = '#7FB8A8',
}: {
  records: { date: string; value: number }[];
  color?: string;
}) {
  if (records.length < 2) return null;
  const values = records.map(r => r.value);
  const min = Math.min(...values) - 5;
  const max = Math.max(...values) + 5;
  const cw = W - PL - PR;
  const ch = H - PT - PB;
  const xs = (i: number) => PL + (i / (records.length - 1)) * cw;
  const ys = (v: number) => PT + ch - ((v - min) / Math.max(1, max - min)) * ch;
  const path = records.map((r, i) => `${i === 0 ? 'M' : 'L'}${xs(i)},${ys(r.value)}`).join(' ');
  const area = `${path} L${xs(records.length - 1)},${PT + ch} L${xs(0)},${PT + ch} Z`;

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ marginTop: 8 }}>
      <defs>
        <linearGradient id="realAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map(p => (
        <line key={p} x1={PL} x2={W - PR} y1={PT + p * ch} y2={PT + p * ch} className="fs-axis-line" strokeDasharray="2 4"/>
      ))}
      {[Math.round(max), Math.round((max + min) / 2), Math.round(min)].map((v, i) => (
        <text key={i} x={PL - 8} y={PT + i * ch / 2 + 4} textAnchor="end" className="fs-axis-label">{v}</text>
      ))}
      {records.length <= 7
        ? records.map((r, i) => (
            <text key={i} x={xs(i)} y={H - 8} textAnchor="middle" className="fs-axis-label">{fmt(r.date)}</text>
          ))
        : [0, Math.floor(records.length / 2), records.length - 1].map(i => (
            <text key={i} x={xs(i)} y={H - 8} textAnchor="middle" className="fs-axis-label">{fmt(records[i].date)}</text>
          ))
      }
      <path d={area} fill="url(#realAreaGrad)"/>
      <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {records.map((r, i) => (
        <circle key={i} cx={xs(i)} cy={ys(r.value)} r={i === records.length - 1 ? 4 : 2.5}
          fill={i === records.length - 1 ? '#fff' : color}
          stroke={color} strokeWidth="2"/>
      ))}
    </svg>
  );
}

export function ScreenTrend({ onNav, user }: { onNav: (s: string) => void; user?: FsUser | null }) {
  const [period, setPeriod] = useState(28);
  const [activeDim, setActiveDim] = useState('acne');
  const [comparePos, setComparePos] = useState(0.5);
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingData(true);
    fetch(`/api/measurements?userId=${user.id}`)
      .then(r => r.json())
      .then((data: MeasurementRecord[]) => {
        if (Array.isArray(data)) setMeasurements(data.reverse()); // 오래된 것 먼저
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [user?.id]);

  // 실제 컴포짓 추세 (최신 30개, period 기준 필터)
  const realCompositeRecords = measurements
    .filter(m => {
      const diff = (Date.now() - new Date(m.created_at).getTime()) / 86400000;
      return diff <= period;
    })
    .map(m => ({ date: m.created_at, value: m.composite_score }));

  const hasRealData = realCompositeRecords.length >= 2;

  // 실제 데이터가 있으면 최신 측정 기준 dimension 점수, 없으면 mock
  const latestReal = measurements.length > 0 ? measurements[measurements.length - 1] : null;
  const dim = SERIES.find(d => d.key === activeDim)!;

  // dimension 차트 - 실제 데이터 있으면 활용
  const DIM_KEY_MAP: Record<string, string> = {
    acne: 'acne', redness: 'redness', pigment: 'pigmentation', wrinkle: 'wrinkles',
    pore: 'pores', oil: 'oiliness', hydra: 'hydration', tone: 'evenness',
    texture: 'texture', firm: 'elasticity',
  };
  const dimSlice = dim.values.slice(-period);
  const dimMin = Math.min(...dimSlice);
  const dimMax = Math.max(...dimSlice);
  const cw = W - PL - PR;
  const ch = H - PT - PB;
  const xs = (i: number) => PL + (i / (dimSlice.length - 1)) * cw;
  const ys = (v: number) => PT + ch - ((v - dimMin) / Math.max(1, dimMax - dimMin)) * ch;
  const mockPath = dimSlice.map((v, i) => `${i === 0 ? 'M' : 'L'}${xs(i)},${ys(v)}`).join(' ');
  const mockArea = `${mockPath} L${xs(dimSlice.length - 1)},${PT + ch} L${xs(0)},${PT + ch} Z`;
  const startDayBase = 28 - period;
  const markers = ROUTINE.filter(r => r.startsDay >= startDayBase).map(r => ({ ...r, x: xs(r.startsDay - startDayBase) }));

  // 현재 dimension 값 (실제 or mock)
  const currentDimVal = latestReal?.scores
    ? (latestReal.scores[DIM_KEY_MAP[dim.key]] ?? dim.values[TODAY_IDX])
    : dim.values[TODAY_IDX];

  // 점수 변화 레이블
  const realFirst = hasRealData ? realCompositeRecords[0].value : undefined;
  const realLast  = hasRealData ? realCompositeRecords[realCompositeRecords.length - 1].value : undefined;

  return (
    <div className="fs-app fs-fade-in" style={{ background: 'var(--fs-bg)', minHeight: '100%', paddingBottom: 100 }}>
      <div style={{ padding: '70px 20px 0' }}>
        <div className="fs-eyebrow">트렌드</div>
        <div className="fs-h1" style={{ marginTop: 4 }}>피부의 변화는<br/>눈이 아니라 그래프로.</div>
      </div>

      <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="fs-seg">
          {[{ l: '7일', v: 7 }, { l: '30일', v: 28 }].map(p => (
            <button key={p.v} className={'fs-seg-item' + (period === p.v ? ' is-active' : '')} onClick={() => setPeriod(p.v)}>{p.l}</button>
          ))}
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fs-ink-2)' }}>
          {Icon.share('#4A463F')}<span>공유</span>
        </button>
      </div>

      {/* 컴포짓 스코어 트렌드 — 실제 데이터 */}
      <div style={{ padding: '14px 20px 0' }}>
        <div className="fs-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <div className="fs-eyebrow" style={{ marginBottom: 4 }}>컴포짓 스코어</div>
              {hasRealData ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div className="fs-num" style={{ fontSize: 36, fontWeight: 500 }}>{realLast}</div>
                  <div className="fs-mono" style={{ fontSize: 12, color: (realLast! - realFirst!) >= 0 ? 'var(--fs-mint-ink)' : 'var(--fs-coral-ink)' }}>
                    {realLast! - realFirst! >= 0 ? '+' : ''}{realLast! - realFirst!} · {realCompositeRecords.length}회 측정
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div className="fs-num" style={{ fontSize: 36, fontWeight: 500 }}>{TODAY_SCORE}</div>
                  <div className="fs-mono" style={{ fontSize: 12, color: 'var(--fs-ink-3)' }}>측정 기록 없음</div>
                </div>
              )}
            </div>
            {hasRealData
              ? <span className="fs-pill fs-pill-mint">{realCompositeRecords.length}회 측정</span>
              : <span className="fs-pill">샘플 데이터</span>
            }
          </div>

          {loadingData ? (
            <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Geist Mono, monospace', fontSize: 11, color: 'var(--fs-ink-3)' }}>
              불러오는 중…
            </div>
          ) : hasRealData ? (
            <RealChart records={realCompositeRecords} color="#7FB8A8"/>
          ) : (
            // 실제 데이터 없으면 안내 메시지
            <div style={{ height: H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ fontFamily: 'Newsreader, serif', fontSize: 16, color: 'var(--fs-ink-2)', textAlign: 'center' }}>
                측정을 시작하면<br/>실제 그래프가 표시됩니다
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 측정 기록 히스토리 */}
      {measurements.length > 0 && (
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="fs-h2">측정 기록</div>
            <div className="fs-caption">총 {measurements.length}회</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...measurements].reverse().slice(0, 5).map((m, i) => {
              const d = new Date(m.created_at);
              const label = `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
              const prevM = [...measurements].reverse()[i + 1];
              const delta = prevM ? m.composite_score - prevM.composite_score : undefined;
              return (
                <div key={m.id} className="fs-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: '#7FB8A822',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Newsreader, serif', fontSize: 18, fontWeight: 600, color: '#2F7A66',
                  }}>
                    {m.composite_score}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{label}</div>
                    {m.summary && (
                      <div className="fs-caption" style={{ marginTop: 2 }}>{m.summary}</div>
                    )}
                  </div>
                  {delta !== undefined && (
                    <div className="fs-mono" style={{ fontSize: 12, color: delta > 0 ? 'var(--fs-mint-ink)' : delta < 0 ? 'var(--fs-coral-ink)' : 'var(--fs-ink-3)' }}>
                      {delta > 0 ? '+' : ''}{delta}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 지표별 차트 (mock) */}
      <div style={{ padding: '14px 20px 0' }}>
        <div className="fs-h2" style={{ marginBottom: 10 }}>지표별 추세</div>
        <div className="fs-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div className="fs-eyebrow" style={{ marginBottom: 4 }}>{dim.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div className="fs-num" style={{ fontSize: 36, fontWeight: 500 }}>{Math.round(currentDimVal)}</div>
                <div className="fs-mono" style={{ fontSize: 12, color: 'var(--fs-ink-3)' }}>
                  {latestReal ? '실측' : `참고값 · ${period}일`}
                </div>
              </div>
            </div>
            <span className="fs-pill">지표</span>
          </div>
          <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ marginTop: 8 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={dim.color} stopOpacity="0.35"/>
                <stop offset="100%" stopColor={dim.color} stopOpacity="0"/>
              </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map(p => <line key={p} x1={PL} x2={W - PR} y1={PT + p * ch} y2={PT + p * ch} className="fs-axis-line" strokeDasharray="2 4"/>)}
            {[dimMax, Math.round((dimMax+dimMin)/2), dimMin].map((v, i) => <text key={i} x={PL - 8} y={PT + i * ch / 2 + 4} textAnchor="end" className="fs-axis-label">{v}</text>)}
            {[0, Math.floor(dimSlice.length/2), dimSlice.length - 1].map(i => <text key={i} x={xs(i)} y={H - 8} textAnchor="middle" className="fs-axis-label">{i === dimSlice.length - 1 ? '오늘' : `${dimSlice.length - 1 - i}일전`}</text>)}
            <path d={mockArea} fill="url(#areaGrad)"/>
            <path d={mockPath} stroke={dim.color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            {markers.map(m => (
              <g key={m.id}>
                <line x1={m.x} x2={m.x} y1={PT} y2={PT + ch} stroke="#1B1A17" strokeDasharray="3 3" strokeWidth="1" opacity="0.4"/>
                <circle cx={m.x} cy={PT - 6} r="4" fill="#1B1A17"/>
              </g>
            ))}
            <circle cx={xs(dimSlice.length - 1)} cy={ys(dimSlice[dimSlice.length - 1])} r="4" fill="#fff" stroke={dim.color} strokeWidth="2.5"/>
          </svg>
        </div>
      </div>

      {/* 지표 탭 */}
      <div style={{ padding: '14px 0 0', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, padding: '0 20px', minWidth: 'max-content' }}>
          {SERIES.map(d => {
            const realVal = latestReal?.scores ? latestReal.scores[DIM_KEY_MAP[d.key]] : undefined;
            const displayVal = realVal !== undefined ? Math.round(realVal) : d.values[TODAY_IDX];
            return (
              <button key={d.key} onClick={() => setActiveDim(d.key)} style={{
                padding: '8px 14px', borderRadius: 999,
                background: activeDim === d.key ? 'var(--fs-ink)' : 'var(--fs-surface)',
                color: activeDim === d.key ? '#fff' : 'var(--fs-ink-2)',
                border: '1px solid ' + (activeDim === d.key ? 'var(--fs-ink)' : 'var(--fs-line-2)'),
                fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
              }}>
                {d.label} · {displayVal}
              </button>
            );
          })}
        </div>
      </div>

      {/* Before/After */}
      <div style={{ padding: '20px 20px 0' }}>
        <div className="fs-h2" style={{ marginBottom: 10 }}>Before / After</div>
        <div className="fs-card" style={{ padding: 14 }}>
          <BeforeAfter pos={comparePos} onChange={setComparePos}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: 'var(--fs-ink-3)' }}>
            {hasRealData ? (
              <>
                <span>{new Date(realCompositeRecords[0].date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</span>
                <span style={{ color: 'var(--fs-mint-ink)', fontWeight: 600 }}>
                  {realLast! - realFirst! >= 0 ? '+' : ''}{realLast! - realFirst!}점
                </span>
                <span>{new Date(realCompositeRecords[realCompositeRecords.length - 1].date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 최신</span>
              </>
            ) : (
              <>
                <span>측정 시작 전</span>
                <span style={{ color: 'var(--fs-mint-ink)', fontWeight: 600 }}>+{TODAY_SCORE - compositeScore(0)}점 (샘플)</span>
                <span>오늘</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 루틴 */}
      <div style={{ padding: '20px 20px 0' }}>
        <div className="fs-h2" style={{ marginBottom: 10 }}>매칭된 루틴</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ROUTINE.map(r => (
            <div key={r.id} className="fs-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 56, borderRadius: 6, background: 'linear-gradient(180deg, #F8E8DD, #E8D4C2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Newsreader, serif', fontSize: 11, color: '#8C5938' }}>{r.brand[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</div>
                <div className="fs-caption" style={{ marginTop: 2 }}>{r.brand} · {28 - r.startsDay}일째 사용</div>
              </div>
              <span className="fs-pill fs-pill-mint">{r.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
