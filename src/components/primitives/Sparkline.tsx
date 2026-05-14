'use client';

export function Sparkline({ values, color = '#1B1A17', width = 80, height = 24, showDot = true }: {
  values: number[]; color?: string; width?: number; height?: number; showDot?: boolean;
}) {
  if (!values?.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as [number, number];
  });
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {showDot && <circle cx={last[0]} cy={last[1]} r="2.5" fill={color}/>}
    </svg>
  );
}
