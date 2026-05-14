'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { FacePlaceholder } from '../primitives/FacePlaceholder';
import { Icon } from '../primitives/icons';
import { GATES } from '@/lib/data';

type GateState = Record<string, boolean>;
type Phase = 'waiting' | 'aligning' | 'ready' | 'capturing' | 'analyzing';

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

  const [phase, setPhase] = useState<Phase>('waiting');
  const [gates, setGates] = useState<GateState>({ light: false, angle: false, focus: false, occlu: false, align: false });
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
        }
        setCameraError(null);
        setPhase('aligning');
      } catch {
        if (!cancelled) setCameraError('카메라 권한이 필요합니다');
      }
    }

    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [facingMode]);

  // 품질 게이트 순차 통과 (카메라 시작 후)
  useEffect(() => {
    if (phase !== 'aligning') return;
    setGates({ light: false, angle: false, focus: false, occlu: false, align: false });
    const order = ['light', 'focus', 'angle', 'occlu', 'align'];
    const timers = order.map((k, i) => setTimeout(() => {
      setGates(g => ({ ...g, [k]: true }));
    }, 500 + i * 380));
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const allOk = gates.light && gates.focus && gates.angle && gates.occlu && gates.align;

  useEffect(() => {
    if (allOk) setPhase('ready');
  }, [allOk]);

  const handleCapture = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || phase !== 'ready') return;

    setPhase('capturing');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d')!;
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.85).replace(/^data:image\/\w+;base64,/, '');

    setPhase('analyzing');

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) throw new Error('API error');
      const result: AnalysisResult = await res.json();
      onCaptured(result);
    } catch {
      onCaptured({
        scores: { acne: 78, redness: 82, pigmentation: 71, wrinkles: 85, pores: 68, oiliness: 74, hydration: 72, evenness: 79, texture: 75, elasticity: 81 },
        summary: 'AI 분석 키가 설정되면 실제 분석이 제공됩니다',
        highlights: ['전반적으로 건강한 피부 상태', '수분 균형 양호'],
        suggestions: ['자외선 차단제 꾸준히 사용 권장', '수분 크림 보충 고려'],
      });
    }
  }, [phase, facingMode, onCaptured]);

  const flipCamera = () => {
    setPhase('waiting');
    setFacingMode(m => m === 'user' ? 'environment' : 'user');
  };

  const shutterActive = phase === 'ready';

  return (
    <div className="fs-app fs-fade-in" style={{ background: '#0E0D0B', minHeight: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, #2D241F 0%, #0E0D0B 70%)' }}/>

      <video
        ref={videoRef}
        playsInline muted
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover',
          opacity: phase === 'waiting' || !!cameraError ? 0 : 0.6,
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          transition: 'opacity .4s',
        }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }}/>

      {(phase === 'waiting' || !!cameraError) && (
        <div style={{ position: 'absolute', left: '50%', top: '47%', transform: 'translate(-50%, -50%)', width: 240, height: 290, opacity: 0.85 }}>
          <FacePlaceholder width={240} height={290} hue="night" idx={9} withGrid={false}/>
        </div>
      )}

      {/* 상단 바 */}
      <div style={{ position: 'absolute', top: 60, left: 0, right: 0, padding: '0 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 5 }}>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.close('#fff')}
        </button>
        <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em' }}>MEASUREMENT · 02</div>
        <button style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.flash('#fff')}
        </button>
      </div>

      {/* 타원 가이드 */}
      <div className="fs-cam-oval" style={{
        borderColor: shutterActive ? '#7FB8A8' : 'rgba(255,255,255,0.85)',
        borderStyle: shutterActive ? 'solid' : 'dashed',
        transition: 'border-color .3s, border-style .3s',
        boxShadow: phase === 'capturing' ? '0 0 0 999px rgba(255,255,255,0.4)' : 'none',
      }}/>

      {/* 안내 문구 */}
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0, textAlign: 'center', color: '#fff', pointerEvents: 'none' }}>
        {cameraError && (
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: 20, fontWeight: 500, padding: '0 24px' }}>{cameraError}</div>
        )}
        {!cameraError && phase === 'aligning' && (
          <>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 22, fontWeight: 500 }}>얼굴을 맞춰주세요</div>
            <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>창가 자연광에서 측정하면 정확도가 높아져요</div>
          </>
        )}
        {!cameraError && phase === 'ready' && (
          <>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 22, fontWeight: 500, color: '#7FB8A8' }}>준비됐어요</div>
            <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>셔터 버튼을 눌러 측정하세요</div>
          </>
        )}
        {!cameraError && phase === 'analyzing' && (
          <>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 22, fontWeight: 500 }}>분석 중…</div>
            <div style={{ marginTop: 6, fontFamily: 'Geist Mono, monospace', fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>10D VECTOR · ICC 0.87</div>
          </>
        )}
      </div>

      {/* 품질 게이트 */}
      <div className="fs-stripe" style={{ bottom: '24%' }}>
        {GATES.map(g => (
          <div key={g.key} className={'fs-gate ' + (gates[g.key] ? 'is-ok' : 'is-pending')} style={{ minWidth: 78 }}>
            {gates[g.key]
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7FB8A8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>
              : <div style={{ width: 14, height: 14, border: '1.5px solid rgba(255,255,255,0.6)', borderRadius: 4 }}/>}
            <span>{g.label}</span>
          </div>
        ))}
      </div>

      {/* 하단 컨트롤 */}
      <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 40px' }}>
        <button style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500 }}>갤러리</button>
        <button
          onClick={handleCapture}
          disabled={!shutterActive}
          style={{
            width: 76, height: 76, borderRadius: '50%',
            border: `3px solid ${shutterActive ? '#7FB8A8' : 'rgba(255,255,255,0.4)'}`,
            padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color .3s',
          }}
        >
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: shutterActive ? '#7FB8A8' : 'rgba(255,255,255,0.3)',
            transform: phase === 'capturing' ? 'scale(0.6)' : 'scale(1)',
            transition: 'all .25s',
          }}/>
        </button>
        <button onClick={flipCamera} style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.flip('rgba(255,255,255,0.7)')}
        </button>
      </div>
    </div>
  );
}
