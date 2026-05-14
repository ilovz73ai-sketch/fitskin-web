'use client';

export function ScoreRing({ score = 72, delta = 0, size = 132 }: { score?: number; delta?: number; size?: number }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const filled = c * (score / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke="#E8E2D6" strokeWidth="6" fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke="#1B1A17" strokeWidth="6" fill="none"
          strokeDasharray={`${filled} ${c}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="fs-num" style={{ fontSize: 40, lineHeight: 1, fontWeight: 500 }}>{score}</div>
        {delta !== 0 && (
          <div style={{ marginTop: 4, fontSize: 11, fontFamily: 'Geist Mono, monospace', color: delta > 0 ? '#2F7A66' : '#B8513C' }}>
            {delta > 0 ? '▲' : '▼'} {Math.abs(delta)} vs 어제
          </div>
        )}
      </div>
    </div>
  );
}
