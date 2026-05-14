'use client';
import { FacePlaceholder } from '../primitives/FacePlaceholder';
import { kakaoLoginUrl } from '@/lib/auth';

export function ScreenOnboard({ onStart }: { onStart: () => void }) {
  const handleKakao = () => {
    window.location.href = kakaoLoginUrl();
  };

  return (
    <div className="fs-app fs-fade-in" style={{ background: '#FAF7F2', minHeight: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="fs-orb" style={{ background: '#E8907E', width: 240, height: 240, top: -60, right: -60 }}/>
      <div className="fs-orb" style={{ background: '#7FB8A8', width: 200, height: 200, bottom: 220, left: -50 }}/>

      <div style={{ position: 'relative', padding: '64px 24px 0' }}>
        <div className="fs-mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--fs-ink-3)' }}>FITSKIN · 2026</div>
        <div className="fs-display" style={{ fontSize: 34, marginTop: 14, lineHeight: 1.0 }}>
          매일 30초,<br/>
          <span style={{ fontStyle: 'italic', fontWeight: 400 }}>피부의 변화를</span><br/>
          증명하는 일.
        </div>
        <div className="fs-body" style={{ marginTop: 14, fontSize: 14, maxWidth: 320, lineHeight: 1.45 }}>
          거울이 아닌 데이터로 보는 스킨케어. 카메라 한 번이면 10가지 차원에서 어제의 피부와 오늘을 비교해드려요.
        </div>
      </div>

      <div style={{ position: 'relative', padding: '24px 24px 0', display: 'flex', justifyContent: 'center', gap: 10 }}>
        <div style={{ transform: 'translateY(14px) rotate(-4deg)' }}><FacePlaceholder width={92} height={116} hue="coral" idx={1} label="04.09"/></div>
        <div style={{ transform: 'translateY(-6px) rotate(3deg)' }}><FacePlaceholder width={100} height={124} hue="warm" idx={5} label="04.23"/></div>
        <div style={{ transform: 'translateY(8px) rotate(-2deg)' }}><FacePlaceholder width={92} height={116} hue="mint" idx={8} label="05.07"/></div>
      </div>

      <div style={{ padding: '22px 24px 0', display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[{ v: 'ICC 0.87', l: '재현성' }, { v: '24h', l: '원본 파기' }, { v: '10D', l: '피부 벡터' }].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div className="fs-num" style={{ fontSize: 20, fontWeight: 500 }}>{s.v}</div>
            <div className="fs-caption" style={{ marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', marginTop: 'auto', padding: '20px 24px 56px' }}>
        <button
          className="fs-btn fs-btn-block"
          onClick={handleKakao}
          style={{ height: 54, fontSize: 15, background: '#FEE500', color: '#191600' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#191600">
            <path d="M12 3C6.48 3 2 6.48 2 11c0 2.52 1.5 4.78 3.84 6.27L4.5 21l4-2.4c1.12.27 2.3.4 3.5.4 5.52 0 10-3.48 10-8s-4.48-8-10-8z"/>
          </svg>
          <span>카카오로 시작하기</span>
        </button>

        <button
          onClick={onStart}
          style={{ width: '100%', marginTop: 14, padding: '10px', fontSize: 13, color: 'var(--fs-ink-3)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          로그인 없이 둘러보기 →
        </button>

        <div className="fs-caption" style={{ textAlign: 'center', marginTop: 8, lineHeight: 1.5, fontSize: 11 }}>
          시작 시 <u>이용약관</u>·<u>개인정보처리방침</u>에 동의하게 됩니다.<br/>
          본 서비스는 의료 진단을 제공하지 않습니다.
        </div>
      </div>
    </div>
  );
}
