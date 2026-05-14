'use client';
import { Icon } from './icons';

type Screen = 'home' | 'trend' | 'routine' | 'me';
const TABS: { key: Screen; label: string; iconKey: keyof typeof Icon }[] = [
  { key: 'home',    label: '홈',    iconKey: 'home' },
  { key: 'trend',   label: '트렌드', iconKey: 'trend' },
  { key: 'routine', label: '루틴',  iconKey: 'routine' },
  { key: 'me',      label: '나',    iconKey: 'user' },
];

export function TabBar({ active, onChange }: { active: string; onChange: (s: string) => void }) {
  return (
    <div className="fs-tabbar" style={{ paddingBottom: 26 }}>
      {TABS.map(t => (
        <button key={t.key} className={'fs-tabbar-item' + (active === t.key ? ' is-active' : '')} onClick={() => onChange(t.key)}>
          {Icon[t.iconKey](active === t.key ? '#1B1A17' : '#8A847A')}
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
