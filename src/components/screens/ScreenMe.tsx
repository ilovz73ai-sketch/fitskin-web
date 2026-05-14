'use client';
import { Icon } from '../primitives/icons';
import type { FsUser } from '@/lib/auth';

export function ScreenMe({ user, onSignOut }: { user?: FsUser | null; onSignOut?: () => void }) {
  const displayName = user?.display_name ?? '게스트';
  const email = user?.email ?? '';
  const provider = user ? '카카오 로그인' : '';

  return (
    <div className="fs-app fs-fade-in" style={{ background: 'var(--fs-bg)', minHeight: '100%', paddingBottom: 100 }}>
      <div style={{ padding: '70px 20px 0' }}>
        <div className="fs-eyebrow">마이</div>
        <div className="fs-h1" style={{ marginTop: 4 }}>{displayName}</div>
        <div className="fs-body" style={{ marginTop: 4, fontSize: 13 }}>{email}{provider ? ` · ${provider}` : ''}</div>
      </div>

      <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[{ v: '234', l: '총 측정' }, { v: '14', l: '연속 일수' }, { v: '2,840', l: '스킨 포인트' }].map((s, i) => (
          <div key={i} className="fs-card" style={{ padding: 14, textAlign: 'center' }}>
            <div className="fs-num" style={{ fontSize: 26, fontWeight: 500 }}>{s.v}</div>
            <div className="fs-caption" style={{ marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <div className="fs-card" style={{ padding: 16, background: 'linear-gradient(135deg, #FBE4DC 0%, #F7EAC9 100%)', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="fs-eyebrow" style={{ color: '#8a4a18' }}>M2E · MEASURE TO EARN</div>
            <span className="fs-pill" style={{ background: 'rgba(255,255,255,0.6)', color: '#8a4a18' }}>+50p 오늘</span>
          </div>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: 18, lineHeight: 1.35, fontWeight: 500, color: '#5a2e10' }}>
            측정할수록 쌓이는 스킨 포인트로<br/>제휴 브랜드 샘플 키트 교환.
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="fs-pill" style={{ background: 'rgba(255,255,255,0.7)', color: '#5a2e10' }}>30일 배지 ▸ +500p</span>
            <span className="fs-pill" style={{ background: 'rgba(255,255,255,0.7)', color: '#5a2e10' }}>샘플 4종 교환 가능</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ padding: 22, borderRadius: 22, background: 'linear-gradient(140deg, #1B1A17 0%, #3A2E26 100%)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -40, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,144,126,0.45) 0%, transparent 70%)' }}/>
          <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, letterSpacing: '0.14em', opacity: 0.7 }}>FITSKIN · PLUS</div>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: 28, fontWeight: 500, marginTop: 10, lineHeight: 1.1 }}>
            증거 기반의<br/>스킨케어, 시작하기.
          </div>
          <div style={{ marginTop: 14, fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>
            AI 맞춤 화장품 Top 10 추천 · 구독자 전용 특가 + 무료배송<br/>PDF 임상 리포트 · 무제한 측정 이력 · 스킨 포인트 2배
          </div>
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="fs-num" style={{ fontSize: 32, fontWeight: 500 }}>4,900<span style={{ fontSize: 14, opacity: 0.7, fontFamily: 'Geist, sans-serif' }}>원/월</span></div>
              <div className="fs-caption" style={{ color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>첫 14일 무료</div>
            </div>
            <button style={{ padding: '12px 18px', borderRadius: 999, background: '#fff', color: '#1B1A17', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              시작하기 {Icon.arrow('#1B1A17')}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        <div className="fs-h2" style={{ marginBottom: 10 }}>설정</div>
        <div className="fs-card" style={{ padding: 0 }}>
          {[{ l: '측정 알림', r: '매일 09:00' }, { l: '주간 리포트', r: '카카오 알림톡' }, { l: 'B2B 측정 위젯', r: '4곳 연결됨' }].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--fs-line-2)' }}>
              <div style={{ fontSize: 14 }}>{row.l}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fs-ink-3)', fontSize: 13 }}>{row.r} {Icon.chevron('#8A847A')}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <div className="fs-h2" style={{ marginBottom: 10 }}>내 데이터</div>
        <div className="fs-card" style={{ padding: 0 }}>
          {[
            { l: '학습 데이터로 활용 동의', sub: '익명·랜드마크 정렬 후 텍스처만', toggle: true },
            { l: '데이터 내려받기', sub: 'JSON · 모든 측정 이력', toggle: false },
            { l: '계정 및 데이터 삭제', sub: '재인증 후 30일 내 완전 파기', toggle: false, danger: true },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--fs-line-2)' }}>
              <div>
                <div style={{ fontSize: 14, color: row.danger ? 'var(--fs-coral-ink)' : 'var(--fs-ink)' }}>{row.l}</div>
                <div className="fs-caption" style={{ marginTop: 2 }}>{row.sub}</div>
              </div>
              {row.toggle
                ? <div style={{ width: 40, height: 24, background: '#D8D2C6', borderRadius: 999, position: 'relative' }}><div style={{ position: 'absolute', top: 2, left: 2, width: 20, height: 20, background: '#fff', borderRadius: '50%' }}/></div>
                : Icon.chevron('#8A847A')}
            </div>
          ))}
        </div>
      </div>

      {onSignOut && (
        <div style={{ padding: '8px 20px 0' }}>
          <button
            onClick={onSignOut}
            style={{ width: '100%', padding: '14px', borderRadius: 16, background: 'none', border: '1px solid var(--fs-line-2)', fontSize: 14, color: 'var(--fs-ink-3)', cursor: 'pointer' }}
          >
            로그아웃
          </button>
        </div>
      )}

      <div style={{ padding: '24px 20px 12px', textAlign: 'center', fontSize: 11, color: 'var(--fs-ink-3)', lineHeight: 1.6 }}>
        FitSkin v0.5.0 · ICC 0.87 · model 3.2.1<br/>
        <span style={{ opacity: 0.7 }}>본 서비스는 의료 진단·처방·치료를 제공하지 않습니다.</span>
      </div>
    </div>
  );
}
