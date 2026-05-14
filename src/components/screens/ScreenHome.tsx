'use client';
import { SERIES, TODAY_IDX, TODAY_SCORE, YDAY_SCORE, WEEK_AGO_SCORE } from '@/lib/data';
import { Icon } from '../primitives/icons';
import { ScoreRing } from '../primitives/ScoreRing';
import { Sparkline } from '../primitives/Sparkline';

export function ScreenHome({ onCapture, onNav }: { onCapture: () => void; onNav: (s: string) => void }) {
  const todayDelta = TODAY_SCORE - YDAY_SCORE;
  const weekDelta = TODAY_SCORE - WEEK_AGO_SCORE;
  const top3 = [...SERIES].sort((a, b) => {
    const da = (a.values[TODAY_IDX] - a.values[TODAY_IDX - 7]) * (a.good === 'high' ? 1 : -1);
    const db = (b.values[TODAY_IDX] - b.values[TODAY_IDX - 7]) * (b.good === 'high' ? 1 : -1);
    return db - da;
  }).slice(0, 3);

  return (
    <div className="fs-app fs-fade-in" style={{ background: 'var(--fs-bg)', minHeight: '100%' }}>
      <div style={{ padding: '70px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="fs-eyebrow">금요일 · 5월 7일</div>
            <div className="fs-h1" style={{ marginTop: 4 }}>안녕, 민지.</div>
          </div>
          <div className="fs-streak">
            {Icon.flame('#8a4a18')}<span>14일</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <div className="fs-card fs-grain" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
          <div className="fs-eyebrow" style={{ marginBottom: 10 }}>오늘의 컴포짓 스코어</div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <ScoreRing score={TODAY_SCORE} delta={todayDelta} size={120}/>
            <div style={{ flex: 1 }}>
              <div className="fs-body" style={{ color: 'var(--fs-ink)', fontSize: 14, lineHeight: 1.45 }}>
                지난 7일 동안 <span style={{ color: 'var(--fs-mint-ink)', fontWeight: 600 }}>{weekDelta >= 0 ? '+' : ''}{weekDelta}점</span> 변화. 여드름 영역이 통계적으로 유의하게 줄었어요.
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="fs-pill fs-pill-mint"><span className="fs-pill-dot"/>여드름 ↓</span>
                <span className="fs-pill fs-pill-mint"><span className="fs-pill-dot"/>수분 ↑</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <button className="fs-btn fs-btn-coral fs-btn-block" onClick={onCapture} style={{ height: 56, fontSize: 16 }}>
          {Icon.camera('#fff')}<span>지금 측정하기 · 25초</span>
        </button>
        <div className="fs-caption" style={{ textAlign: 'center', marginTop: 8 }}>마지막 측정 어제 오전 8:14 · 14일 연속</div>
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
            const delta = d.values[TODAY_IDX] - d.values[TODAY_IDX - 7];
            const better = d.good === 'high' ? delta > 0 : delta < 0;
            return (
              <div key={d.key} className="fs-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: d.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: d.color, fontFamily: 'Newsreader, serif', fontSize: 18, fontWeight: 600 }}>
                  {d.values[TODAY_IDX]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{d.label}</div>
                  <div className="fs-caption" style={{ marginTop: 2 }}>7일 전 대비 {delta > 0 ? '+' : ''}{delta} · {better ? '개선' : '주의'}</div>
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
              <div style={{ fontFamily: 'Newsreader, serif', fontSize: 17, fontWeight: 500, marginTop: 2 }}>지금 민지 피부에 맞는 추천</div>
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
            <div className="fs-caption" style={{ marginTop: 2 }}>스킨 포인트 2,840p · 샘플 4종 교환 가능</div>
          </div>
          {Icon.chevron('#8A847A')}
        </div>
      </div>
    </div>
  );
}
