'use client';
import { ROUTINE, TODAY_SCORE, compositeScore } from '@/lib/data';
import { Icon } from '../primitives/icons';

export function ScreenRoutine() {
  return (
    <div className="fs-app fs-fade-in" style={{ background: 'var(--fs-bg)', minHeight: '100%', paddingBottom: 100 }}>
      <div style={{ padding: '70px 20px 0' }}>
        <div className="fs-eyebrow">루틴</div>
        <div className="fs-h1" style={{ marginTop: 4 }}>지금 쓰는 제품과<br/>피부 변화의 지도.</div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div className="fs-h2">사용 중 · 3</div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: 'var(--fs-ink)' }}>
            {Icon.plus('#1B1A17')}<span>제품 추가</span>
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ROUTINE.map(r => (
            <div key={r.id} className="fs-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 50, height: 64, borderRadius: 6, background: 'linear-gradient(180deg, #F8E8DD, #E8D4C2)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6, fontFamily: 'Newsreader, serif', fontSize: 10, color: '#8C5938', letterSpacing: '0.1em' }}>{r.brand}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</div>
                  <div className="fs-caption" style={{ marginTop: 2 }}>{r.type} · {28 - r.startsDay}일째</div>
                  <div style={{ marginTop: 8 }}><span className="fs-pill fs-pill-mint">{r.impact}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        <div className="fs-h2" style={{ marginBottom: 14 }}>타임라인</div>
        <div className="fs-card" style={{ padding: 18 }}>
          <div className="fs-timeline">
            {[
              { day: 28, title: '오늘 측정',               sub: `컴포짓 ${TODAY_SCORE}점`,              tag: 'meas' },
              { day: 23, title: '레티놀 0.1% 시작',         sub: '닥터자르트 · 야간 루틴',               tag: 'product' },
              { day: 16, title: '하이드로 부스터 토너 시작', sub: '라네즈 · 수분 +24%',                  tag: 'product' },
              { day: 14, title: '7일 연속 측정 달성',       sub: '첫 마일스톤',                          tag: 'milestone' },
              { day: 9,  title: '센텔라 시카 세럼 시작',    sub: '닥터지 · 여드름 18% 감소',             tag: 'product' },
              { day: 0,  title: '첫 측정',                  sub: `컴포짓 ${compositeScore(0)}점`,        tag: 'meas' },
            ].map((e, i) => (
              <div key={i} style={{ position: 'relative', paddingBottom: 18 }}>
                <div className="fs-tl-dot" style={{ background: e.tag === 'milestone' ? '#FFE4B8' : '#fff', borderColor: e.tag === 'product' ? '#7FB8A8' : '#1B1A17' }}/>
                <div style={{ paddingLeft: 8 }}>
                  <div className="fs-mono" style={{ fontSize: 10, color: 'var(--fs-ink-3)', letterSpacing: '0.08em' }}>{e.day === 28 ? '오늘' : `${28 - e.day}일 전`}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{e.title}</div>
                  <div className="fs-caption" style={{ marginTop: 2 }}>{e.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <div className="fs-card-flat" style={{ borderLeft: '3px solid #D9A441', padding: 16 }}>
          <div className="fs-eyebrow" style={{ color: '#8a6418', marginBottom: 6 }}>성분 알림</div>
          <div style={{ fontSize: 14, lineHeight: 1.45 }}>레티놀과 AHA를 같은 시간대에 사용 중이에요. 자극 위험이 있어요 — 격일로 분리해 보시는 걸 추천드려요.</div>
        </div>
      </div>
    </div>
  );
}
