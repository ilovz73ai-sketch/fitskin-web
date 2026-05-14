'use client';
import { useState, useEffect } from 'react';
import { FacePlaceholder } from '../primitives/FacePlaceholder';
import { Icon } from '../primitives/icons';
import { GATES } from '@/lib/data';

type GateState = Record<string, boolean>;

export function ScreenCamera({ onClose, onCaptured }: { onClose: () => void; onCaptured: () => void }) {
  const [phase, setPhase] = useState<'aligning' | 'ready' | 'shutter' | 'analyzing'>('aligning');
  const [gates, setGates] = useState<GateState>({ light: false, angle: false, focus: false, occlu: false, align: false });

  useEffect(() => {
    const order = ['light', 'focus', 'angle', 'occlu', 'align'];
    const timers = order.map((k, i) => setTimeout(() => {
      setGates(g => ({ ...g, [k]: true }));
    }, 350 + i * 380));
    return () => timers.forEach(clearTimeout);
  }, []);

  const allOk = Object.values(gates).every(Boolean);

  useEffect(() => {
    if (!allOk) return;
    setPhase('ready');
    const t1 = setTimeout(() => setPhase('shutter'), 700);
    const t2 = setTimeout(() => setPhase('analyzing'), 950);
    const t3 = setTimeout(() => onCaptured(), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [allOk, onCaptured]);

  return (
    <div className="fs-app fs-fade-in" style={{ background: '#0E0D0B', minHeight: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, #2D241F 0%, #0E0D0B 70%)' }}/>

      <div style={{ position: 'absolute', left: '50%', top: '47%', transform: 'translate(-50%, -50%)', width: 240, height: 290, opacity: 0.85 }}>
        <FacePlaceholder width={240} height={290} hue="night" idx={9} withGrid={phase === 'analyzing'}/>
      </div>

      <div style={{ position: 'absolute', top: 60, left: 0, right: 0, padding: '0 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 5 }}>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.close('#fff')}
        </button>
        <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em' }}>MEASUREMENT · 02</div>
        <button style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.flash('#fff')}
        </button>
      </div>

      <div className="fs-cam-oval" style={{
        borderColor: (phase === 'shutter' || allOk) ? '#7FB8A8' : 'rgba(255,255,255,0.85)',
        borderStyle: allOk ? 'solid' : 'dashed',
        transition: 'border-color .3s, border-style .3s',
        boxShadow: phase === 'shutter' ? '0 0 0 999px rgba(255,255,255,0.4)' : 'none',
      }}/>

      {phase === 'aligning' && (
        <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', color: '#fff' }}>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: 22, fontWeight: 500 }}>얼굴을 맞춰주세요</div>
          <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>창가 자연광에서 측정하면 정확도가 높아져요</div>
        </div>
      )}
      {phase === 'analyzing' && (
        <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', color: '#fff' }}>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: 22, fontWeight: 500 }}>분석 중…</div>
          <div style={{ marginTop: 6, fontFamily: 'Geist Mono, monospace', fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>CALIBRATION · 10D VECTOR · ICC 0.87</div>
        </div>
      )}

      <div className="fs-stripe" style={{ bottom: '24%' }}>
        {GATES.map(g => (
          <div key={g.key} className={'fs-gate ' + (gates[g.key] ? 'is-ok' : 'is-pending')} style={{ minWidth: 78 }}>
            {gates[g.key]
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7FB8A8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>
              : <div style={{ width: 14, height: 14, border: '1.5px solid rgba(255,255,255,0.6)', borderRadius: 4 }}/>}
            <span>{g.label}</span>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 40px' }}>
        <button style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500 }}>갤러리</button>
        <div style={{ width: 76, height: 76, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.85)', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: phase === 'shutter' ? '#7FB8A8' : 'rgba(255,255,255,0.92)', transform: phase === 'shutter' ? 'scale(0.6)' : 'scale(1)', transition: 'all .25s' }}/>
        </div>
        <button style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.flip('rgba(255,255,255,0.7)')}
        </button>
      </div>
    </div>
  );
}
