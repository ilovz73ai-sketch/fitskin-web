'use client';

type IconFn = (color?: string) => React.ReactElement;

const s = (c = 'currentColor') => ({ stroke: c, strokeWidth: '1.6', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' });

export const Icon: Record<string, IconFn> = {
  camera: (c) => <svg width="22" height="22" viewBox="0 0 24 24" {...s(c)}><path d="M3 8.5A2 2 0 015 6.5h2.5l1.5-2h6l1.5 2H19a2 2 0 012 2v9A2 2 0 0119 19.5H5a2 2 0 01-2-2v-9z"/><circle cx="12" cy="13" r="3.6"/></svg>,
  trend:  (c) => <svg width="22" height="22" viewBox="0 0 24 24" {...s(c)}><path d="M3 17l5-5 4 3 8-8"/><path d="M14 7h6v6"/></svg>,
  routine:(c) => <svg width="22" height="22" viewBox="0 0 24 24" {...s(c)}><rect x="6" y="3" width="12" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>,
  user:   (c) => <svg width="22" height="22" viewBox="0 0 24 24" {...s(c)}><circle cx="12" cy="9" r="3.5"/><path d="M5 20c1-3.5 4-5 7-5s6 1.5 7 5"/></svg>,
  home:   (c) => <svg width="22" height="22" viewBox="0 0 24 24" {...s(c)}><path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-9z"/></svg>,
  arrow:  (c) => <svg width="14" height="14" viewBox="0 0 24 24" {...s(c)} strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  check:  (c) => <svg width="14" height="14" viewBox="0 0 24 24" {...s(c)} strokeWidth="2.5"><path d="M4 12l5 5L20 6"/></svg>,
  chevron:(c) => <svg width="14" height="14" viewBox="0 0 24 24" {...s(c)} strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>,
  share:  (c) => <svg width="18" height="18" viewBox="0 0 24 24" {...s(c)}><path d="M12 3v12M8 7l4-4 4 4M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6"/></svg>,
  bell:   (c) => <svg width="18" height="18" viewBox="0 0 24 24" {...s(c)}><path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15L6 16z"/><path d="M10 20a2 2 0 004 0"/></svg>,
  flash:  (c) => <svg width="18" height="18" viewBox="0 0 24 24" {...s(c)}><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/></svg>,
  flip:   (c) => <svg width="18" height="18" viewBox="0 0 24 24" {...s(c)}><path d="M3 12a9 9 0 0114-7.5L20 7M21 12a9 9 0 01-14 7.5L4 17M16 7h4V3M4 17H4v4"/></svg>,
  close:  (c) => <svg width="18" height="18" viewBox="0 0 24 24" {...s(c)} strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  plus:   (c) => <svg width="14" height="14" viewBox="0 0 24 24" {...s(c)} strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>,
  flame:  (c) => <svg width="14" height="14" viewBox="0 0 24 24" {...s(c)}><path d="M12 3c1 4 4 5 4 9a4 4 0 11-8 0c0-2 1-3 1-5 1 1 2 1 3-4z"/></svg>,
  spark:  (c) => <svg width="14" height="14" viewBox="0 0 24 24" {...s(c)} strokeWidth="1.8"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3"/></svg>,
};
