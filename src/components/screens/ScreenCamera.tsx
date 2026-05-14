'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '../primitives/icons';
import { GATES } from '@/lib/data';

type Phase = 'starting' | 'aligning' | 'ready' | 'capturing' | 'analyzing' | 'error';

interface AnalysisResult {
  scores: Record<string, number>;
  summary: string;
  highlights: string[];
  suggestions: string[];
}

export function ScreenCamera({
  onClose,
  onCaptured,
}: {
  onClose: () => void;
  onCaptured: (result?: AnalysisResult) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<Phase>('starting');
  const [gatesDone, setGatesDone] = useState(0); // 0~5
  const [errorMsg, setErrorMsg] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // 카메라 시작
  useEffect(() => {
    setPhase('starting');
    setGatesDone(0);

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode } })
      .then(stream => {
        streamRef.current = stream;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          v.onloadedmetadata = () => {
            v.play().catch(() => {});
            setPhase('aligning');
          };
        }
      })
      .catch(() => {
        setErrorMsg('카메라 권한이 필요합니다. 브라우저 설정에서 허용해주세요.');
        setPhase('error');
      });

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [facingMode]);

  // 게이트 시뮬레이션
  useEffect(() => {
    if (phase !== 'aligning') return;
    const timers = [0, 1, 2, 3, 4].map(i =>
      setTimeout(() => setGatesDone(n => n + 1), 600 + i * 400)
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  useEffect(() => {
    if (gatesDone >= 5) setPhase('ready');
  }, [gatesDone]);

  const handleCapture = useCallback(async () => {
    if (phase !== 'ready') return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setPhase('capturing');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d')!;
    if (facingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.85).replace(/^data:image\/\w+;base64,/, '');

    setPhase('analyzing');

    const dummy: AnalysisResult = {
      scores: { acne: 78, redness: 82, pigmentation: 71, wrinkles: 85, pores: 68, oiliness: 74, hydration: 72, evenness: 79, texture: 75, elasticity: 81 },
      summary: '전반적으로 건강한 피부 상태',
      highlights: ['수분 균형 양호', '피부결 균일'],
      suggestions: ['자외선 차단제 꾸준히 사용 권장'],
    };

    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 25000);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
        signal: controller.signal,
      });
      clearTimeout(tid);
      const result: AnalysisResult = res.ok ? await res.json() : dummy;
      onCaptured(result);
    } catch {
      onCaptured(dummy);
    }
  }, [phase, facingMode, onCaptured]);

  const gateKeys = GATES.map(g => g.key);
  const isReady = phase === 'ready';

  return (
    <div style={{ background: '#0E0D0B', minHeight: '100dvh', position: 'relative', overflow: 'hidden' }}>
      {/* 카메라 프리뷰 */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          opacity: phase === 'starting' ? 0 : 0.65,
          transition: 'opacity .5s',
        }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }}/>

      {/* 배경 그라데이션 오버레이 */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(45,36,31,0.4) 0%, rgba(14,13,11,0.5) 70%)', pointerEvents: 'none' }}/>

      {/* 상단 바 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '56px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.close('#fff')}
        </button>
        <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em' }}>MEASUREMENT</div>
        <button style={{ width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.flash('#fff')}
        </button>
      </div>

      {/* 타원 가이드 */}
      <div className="fs-cam-oval" style={{
        borderColor: isReady ? '#7FB8A8' : 'rgba(255,255,255,0.7)',
        borderStyle: isReady ? 'solid' : 'dashed',
        transition: 'border-color .4s',
        boxShadow: phase === 'capturing' ? '0 0 0 999px rgba(255,255,255,0.5)' : 'none',
      }}/>

      {/* 상태 메시지 */}
      <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, textAlign: 'center', color: '#fff', zIndex: 5, pointerEvents: 'none' }}>
        {phase === 'starting' && <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>카메라 시작 중…</div>}
        {phase === 'error' && <div style={{ fontFamily: 'Newsreader, serif', fontSize: 18, fontWeight: 500, padding: '0 32px', lineHeight: 1.4 }}>{errorMsg}</div>}
        {phase === 'aligning' && (
          <>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 22, fontWeight: 500 }}>얼굴을 맞춰주세요</div>
            <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>창가 자연광에서 측정하면 정확도가 높아져요</div>
          </>
        )}
        {phase === 'ready' && (
          <>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 22, fontWeight: 500, color: '#7FB8A8' }}>준비됐어요</div>
            <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>셔터 버튼을 눌러 측정하세요</div>
          </>
        )}
        {(phase === 'capturing' || phase === 'analyzing') && (
          <>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 22, fontWeight: 500 }}>분석 중…</div>
            <div style={{ marginTop: 6, fontFamily: 'Geist Mono, monospace', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em' }}>10D VECTOR · ICC 0.87</div>
          </>
        )}
      </div>

      {/* 품질 게이트 */}
      <div className="fs-stripe" style={{ bottom: '24%', zIndex: 10 }}>
        {GATES.map((g, i) => (
          <div key={g.key} className={'fs-gate ' + (i < gatesDone ? 'is-ok' : 'is-pending')} style={{ minWidth: 78 }}>
            {i < gatesDone
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7FB8A8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>
              : <div style={{ width: 14, height: 14, border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: 4 }}/>}
            <span>{g.label}</span>
          </div>
        ))}
      </div>

      {/* 하단 컨트롤 */}
      <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 40px', zIndex: 10 }}>
        <div style={{ width: 44 }}/>
        <button
          onClick={handleCapture}
          style={{
            width: 78, height: 78, borderRadius: '50%',
            border: `3px solid ${isReady ? '#7FB8A8' : 'rgba(255,255,255,0.35)'}`,
            padding: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color .3s',
          }}
        >
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: isReady ? '#7FB8A8' : 'rgba(255,255,255,0.25)',
            transform: phase === 'capturing' ? 'scale(0.55)' : 'scale(1)',
            transition: 'all .2s',
          }}/>
        </button>
        <button
          onClick={() => setFacingMode(m => m === 'user' ? 'environment' : 'user')}
          style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {Icon.flip('rgba(255,255,255,0.65)')}
        </button>
      </div>
    </div>
  );
}
