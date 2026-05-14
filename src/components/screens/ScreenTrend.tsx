'use client';
import { useState, useRef, useCallback } from 'react';
import { SERIES, ROUTINE, TODAY_IDX, TODAY_SCORE, compositeScore } from '@/lib/data';
import { Icon } from '../primitives/icons';
import { FacePlaceholder } from '../primitives/FacePlaceholder';

const W = 320, H = 160, PT = 16, PB = 28, PL = 28, PR = 8;

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
      <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em' }}>BEFORE · 04.09</div>
      <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em' }}>AFTER · 05.07</div>
      <div className="fs-ba-handle" style={{ left: `${pos * 100}%` }}>
        <div className="fs-ba-knob">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B1A17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg>
        </div>
      </div>
    </div>
  );
}

export function ScreenTrend({ onNav }: { onNav: (s: string) => void }) {
  const [period, setPeriod] = useState(28);
  const [activeDim, setActiveDim] = useState('acne');
  const [comparePos, setComparePos] = useState(0.5);

  const dim = SERIES.find(d => d.key === activeDim)!;
  const slice = dim.values.slice(-period);
  const min = Math.min(...slice);
  const max = Math.max(...slice);
  const cw = W - PL - PR;
  const ch = H - PT - PB;
  const xs = (i: number) => PL + (i / (slice.length - 1)) * cw;
  const ys = (v: number) => PT + ch - ((v - min) / Math.max(1, max - min)) * ch;
  const path = slice.map((v, i) => `${i === 0 ? 'M' : 'L'}${xs(i)},${ys(v)}`).join(' ');
  const area = `${path} L${xs(slice.length - 1)},${PT + ch} L${xs(0)},${PT + ch} Z`;
  const startDayBase = 28 - period;
  const markers = ROUTINE.filter(r => r.startsDay >= startDayBase).map(r => ({ ...r, x: xs(r.startsDay - startDayBase) }));

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

      <div style={{ padding: '14px 20px 0' }}>
        <div className="fs-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div className="fs-eyebrow" style={{ marginBottom: 4 }}>{dim.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div className="fs-num" style={{ fontSize: 36, fontWeight: 500 }}>{dim.values[TODAY_IDX]}</div>
                <div className="fs-mono" style={{ fontSize: 12, color: 'var(--fs-mint-ink)' }}>
                  {(() => { const dl = dim.values[TODAY_IDX] - dim.values[TODAY_IDX - period + 1]; return `${dl > 0 ? '+' : ''}${dl} · ${period}일`; })()}
                </div>
              </div>
            </div>
            <span className="fs-pill fs-pill-mint">유의함 p &lt; 0.05</span>
          </div>
          <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ marginTop: 8 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={dim.color} stopOpacity="0.35"/>
                <stop offset="100%" stopColor={dim.color} stopOpacity="0"/>
              </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map(p => <line key={p} x1={PL} x2={W - PR} y1={PT + p * ch} y2={PT + p * ch} className="fs-axis-line" strokeDasharray="2 4"/>)}
            {[max, Math.round((max+min)/2), min].map((v, i) => <text key={i} x={PL - 8} y={PT + i * ch / 2 + 4} textAnchor="end" className="fs-axis-label">{v}</text>)}
            {[0, Math.floor(slice.length/2), slice.length - 1].map(i => <text key={i} x={xs(i)} y={H - 8} textAnchor="middle" className="fs-axis-label">{i === slice.length - 1 ? '오늘' : `${slice.length - 1 - i}일전`}</text>)}
            <path d={area} fill="url(#areaGrad)"/>
            <path d={path} stroke={dim.color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            {markers.map(m => (
              <g key={m.id}>
                <line x1={m.x} x2={m.x} y1={PT} y2={PT + ch} stroke="#1B1A17" strokeDasharray="3 3" strokeWidth="1" opacity="0.4"/>
                <circle cx={m.x} cy={PT - 6} r="4" fill="#1B1A17"/>
              </g>
            ))}
            <circle cx={xs(slice.length - 1)} cy={ys(slice[slice.length - 1])} r="4" fill="#fff" stroke={dim.color} strokeWidth="2.5"/>
          </svg>
        </div>
      </div>

      <div style={{ padding: '14px 0 0', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, padding: '0 20px', minWidth: 'max-content' }}>
          {SERIES.map(d => (
            <button key={d.key} onClick={() => setActiveDim(d.key)} style={{ padding: '8px 14px', borderRadius: 999, background: activeDim === d.key ? 'var(--fs-ink)' : 'var(--fs-surface)', color: activeDim === d.key ? '#fff' : 'var(--fs-ink-2)', border: '1px solid ' + (activeDim === d.key ? 'var(--fs-ink)' : 'var(--fs-line-2)'), fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>
              {d.label} · {d.values[TODAY_IDX]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <div className="fs-h2" style={{ marginBottom: 10 }}>Before / After</div>
        <div className="fs-card" style={{ padding: 14 }}>
          <BeforeAfter pos={comparePos} onChange={setComparePos}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: 'var(--fs-ink-3)' }}>
            <span>4월 9일 (28일 전)</span>
            <span style={{ color: 'var(--fs-mint-ink)', fontWeight: 600 }}>+{TODAY_SCORE - compositeScore(0)}점</span>
            <span>5월 7일 오늘</span>
          </div>
        </div>
      </div>

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
