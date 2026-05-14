export type SkinDim = {
  key: string;
  label: string;
  short: string;
  color: string;
  good: 'high' | 'low';
  start: number;
  end: number;
  values: number[];
};

export type RoutineItem = {
  id: string;
  name: string;
  brand: string;
  startsDay: number;
  ends: null;
  type: string;
  impact: string;
};

export type QualityGate = { key: string; label: string };

const SKIN_DIMS_RAW = [
  { key: 'acne',    label: '여드름',   short: '여드름', color: '#E8907E', good: 'low'  as const, start: 64, end: 38 },
  { key: 'redness', label: '홍반',     short: '홍반',   color: '#D9614A', good: 'low'  as const, start: 52, end: 34 },
  { key: 'pigment', label: '색소침착', short: '색소',   color: '#B8825A', good: 'low'  as const, start: 48, end: 42 },
  { key: 'wrinkle', label: '잔주름',   short: '잔주름', color: '#A48A6E', good: 'low'  as const, start: 30, end: 28 },
  { key: 'pore',    label: '모공',     short: '모공',   color: '#8A847A', good: 'low'  as const, start: 58, end: 46 },
  { key: 'oil',     label: '유분',     short: '유분',   color: '#D9A441', good: 'low'  as const, start: 62, end: 51 },
  { key: 'hydra',   label: '수분',     short: '수분',   color: '#7FB8A8', good: 'high' as const, start: 48, end: 71 },
  { key: 'tone',    label: '톤 균일도',short: '톤',     color: '#C7A98F', good: 'high' as const, start: 55, end: 68 },
  { key: 'texture', label: '텍스처',   short: '텍스처', color: '#8FA89E', good: 'high' as const, start: 59, end: 73 },
  { key: 'firm',    label: '탄력',     short: '탄력',   color: '#6B5BA8', good: 'high' as const, start: 60, end: 66 },
];

function genSeries(start: number, end: number, days = 28, seed = 1): number[] {
  let s = seed * 9301 + 49297;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const out: number[] = [];
  for (let i = 0; i < days; i++) {
    const t = i / (days - 1);
    const eased = 1 - Math.pow(1 - t, 1.6);
    const v = start + (end - start) * eased + (rand() - 0.5) * 5;
    out.push(Math.round(Math.max(0, Math.min(100, v))));
  }
  return out;
}

export const SERIES: SkinDim[] = SKIN_DIMS_RAW.map((d, i) => ({
  ...d,
  values: genSeries(d.start, d.end, 28, i + 1),
}));

export function compositeScore(idx: number): number {
  let total = 0;
  SERIES.forEach(d => {
    const v = d.values[idx];
    total += d.good === 'high' ? v : 100 - v;
  });
  return Math.round(total / SERIES.length);
}

export const TODAY_IDX = 27;
export const TODAY_SCORE = compositeScore(TODAY_IDX);
export const YDAY_SCORE = compositeScore(26);
export const WEEK_AGO_SCORE = compositeScore(TODAY_IDX - 7);

export const ROUTINE: RoutineItem[] = [
  { id: 'r1', name: '센텔라 시카 세럼',      brand: '닥터지',    startsDay: 5,  ends: null, type: 'serum',     impact: '여드름 -18%' },
  { id: 'r2', name: '하이드로 부스터 토너',   brand: '라네즈',    startsDay: 12, ends: null, type: 'toner',     impact: '수분 +24%' },
  { id: 'r3', name: '레티놀 0.1% 나이트',    brand: '닥터자르트', startsDay: 18, ends: null, type: 'treatment', impact: '관찰 중' },
];

export const GATES: QualityGate[] = [
  { key: 'light', label: '조명' },
  { key: 'angle', label: '각도' },
  { key: 'focus', label: '초점' },
  { key: 'occlu', label: '가림' },
  { key: 'align', label: '정렬' },
];
