'use client';
import { useState } from 'react';
import { FacePlaceholder } from '../primitives/FacePlaceholder';
import { signInWithKakao } from '@/lib/auth';

export function ScreenOnboard({ onStart }: { onStart: () => void }) {
  const [loading, setLoading] = useState<'kakao' | null>(null);

  const handleKakao = async () => {
    setLoading('kakao');
    try {
      await signInWithKakao();
      // OAuth redirect 발생 — 이 이후 코드는 실행되지 않음
    } catch {
      setLoading(null);
    }
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
        {/* 카카오 로그인 */}
        <button
          className="fs-btn fs-btn-block"
          onClick={handleKakao}
          disabled={loading === 'kakao'}
          style={{ height: 54, fontSize: 15, background: '#FEE500', color: '#191600', opacity: loading === 'kakao' ? 0.7 : 1 }}
        >
          {loading === 'kakao' ? (
            <span>연결 중…</span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#191600">
                <path d="M12 3C6.48 3 2 6.48 2 11c0 2.52 1.5 4.78 3.84 6.27L4.5 21l4-2.4c1.12.27 2.3.4 3.5.4 5.52 0 10-3.48 10-8s-4.48-8-10-8z"/>
              </svg>
              <span>카카오로 시작하기</span>
            </>
          )}
        </button>

        {/* 구글 / 애플 */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button className="fs-btn fs-btn-ghost" style={{ flex: 1, height: 46, fontSize: 13, gap: 6, padding: '0 12px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-8z"/>
              <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.2 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8C3.9 20.5 7.6 23 12 23z"/>
              <path fill="#FBBC05" d="M5.7 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7.1H2.1A11 11 0 001 12c0 1.8.4 3.5 1.1 4.9l3.6-2.8z"/>
              <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.1-3.1C17.5 2.1 15 1 12 1 7.6 1 3.9 3.5 2.1 7.1l3.6 2.8C6.6 7.4 9.1 5.4 12 5.4z"/>
            </svg>
            <span>Google</span>
          </button>
          <button className="fs-btn fs-btn-ghost" style={{ flex: 1, height: 46, fontSize: 13, gap: 6, padding: '0 12px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#1B1A17">
              <path d="M17.05 12.04c-.03-2.4 1.96-3.55 2.05-3.61-1.12-1.64-2.86-1.86-3.48-1.89-1.48-.15-2.9.87-3.65.87-.76 0-1.92-.85-3.16-.83-1.62.02-3.13.95-3.96 2.4-1.7 2.94-.43 7.27 1.21 9.65.8 1.16 1.76 2.46 3.01 2.42 1.21-.05 1.67-.78 3.13-.78 1.46 0 1.87.78 3.15.76 1.3-.02 2.13-1.18 2.92-2.35.93-1.34 1.31-2.65 1.33-2.72-.03-.01-2.55-.98-2.58-3.92zM14.66 4.84c.66-.81 1.11-1.92.99-3.04-.96.04-2.13.64-2.82 1.44-.61.71-1.16 1.86-1.02 2.95 1.07.08 2.18-.55 2.85-1.35z"/>
            </svg>
            <span>Apple</span>
          </button>
        </div>

        {/* 비로그인 진행 */}
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
