'use client';

type Hue = 'warm' | 'cool' | 'night' | 'coral' | 'mint';

const PALETTES: Record<Hue, { bg: string; skin: string; shade: string; ink: string }> = {
  warm:  { bg: '#F4DCC8', skin: '#E8C2A4', shade: '#D9A687', ink: '#8C5938' },
  cool:  { bg: '#E5E1DC', skin: '#D9CDC0', shade: '#B8A89A', ink: '#5C5045' },
  night: { bg: '#1F2D3A', skin: '#3E4E5C', shade: '#2C3A48', ink: '#7FB8A8' },
  coral: { bg: '#FBE4DC', skin: '#F1C4B4', shade: '#E8A892', ink: '#B8513C' },
  mint:  { bg: '#E0EFEA', skin: '#C6DDD2', shade: '#A8C4B8', ink: '#2F7A66' },
};

export function FacePlaceholder({
  width = 240, height = 280, hue = 'warm' as Hue,
  label, withGrid = false, blur = false, idx = 0,
}: {
  width?: number | string; height?: number | string;
  hue?: Hue; label?: string; withGrid?: boolean; blur?: boolean; idx?: number;
}) {
  const p = PALETTES[hue] ?? PALETTES.warm;
  const seed = idx * 7 + 1;
  const tilt = ((seed % 5) - 2) * 1.5;
  return (
    <div style={{ width, height, position: 'relative', borderRadius: 20, overflow: 'hidden', background: p.bg, filter: blur ? 'blur(2px)' : 'none' }}>
      <svg viewBox="0 0 200 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
        style={{ transform: `rotate(${tilt}deg) scale(1.05)` }}>
        <defs>
          <radialGradient id={`bg-${idx}`} cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor={p.bg}/>
            <stop offset="100%" stopColor={p.shade} stopOpacity="0.4"/>
          </radialGradient>
        </defs>
        <rect width="200" height="240" fill={`url(#bg-${idx})`}/>
        <path d="M -20 240 Q 100 170 220 240 Z" fill={p.shade} opacity="0.7"/>
        <rect x="82" y="155" width="36" height="40" rx="16" fill={p.skin}/>
        <ellipse cx="100" cy="110" rx="58" ry="68" fill={p.skin}/>
        <path d="M 42 95 Q 50 40 100 38 Q 150 40 158 95 Q 158 78 142 70 Q 120 55 100 56 Q 78 57 60 70 Q 42 80 42 95 Z" fill={p.ink} opacity="0.78"/>
        <ellipse cx="72" cy="120" rx="14" ry="10" fill={p.shade} opacity="0.4"/>
        <ellipse cx="128" cy="120" rx="14" ry="10" fill={p.shade} opacity="0.4"/>
        <path d="M 72 105 Q 78 108 84 105" stroke={p.ink} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.5"/>
        <path d="M 116 105 Q 122 108 128 105" stroke={p.ink} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.5"/>
        <path d="M 92 142 Q 100 144 108 142" stroke={p.ink} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.55"/>
        {hue === 'coral' && (
          <>
            <circle cx="80" cy="128" r="1.5" fill={p.ink} opacity="0.5"/>
            <circle cx="118" cy="132" r="1.4" fill={p.ink} opacity="0.4"/>
            <circle cx="92" cy="135" r="1.2" fill={p.ink} opacity="0.45"/>
            <circle cx="125" cy="115" r="1" fill={p.ink} opacity="0.4"/>
          </>
        )}
        {withGrid && (
          <g opacity="0.35" stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" fill="none">
            <ellipse cx="100" cy="110" rx="58" ry="68"/>
            <path d="M 42 110 Q 100 116 158 110"/>
            <path d="M 100 42 Q 92 110 100 178"/>
            <path d="M 60 80 Q 100 90 140 80"/>
            <path d="M 60 140 Q 100 150 140 140"/>
          </g>
        )}
      </svg>
      {label && (
        <div style={{ position: 'absolute', bottom: 10, left: 10, fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: 999, letterSpacing: '0.08em' }}>
          {label}
        </div>
      )}
    </div>
  );
}
