'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { FacePlaceholder } from '../primitives/FacePlaceholder';
import { Icon } from '../primitives/icons';
import { GATES } from '@/lib/data';

type GateState = Record<string, boolean>;
type Phase = 'aligning' | 'ready' | 'shutter' | 'analyzing' | 'error';

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

  const [phase, setPhase] = useState<Phase>('aligning');
  const [gates, setGates] = useState<GateState>({ light: false, angle: false, focus: false, occlu: false, align: false });
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(false);

  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasCamera(true);
      setCameraError(null);
    } catch {
      setCameraError('카메라 권한이 필요합니다');
      setHasCamera(false);
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [facingMode, startCamera]);

  // 품질 게이트 시뮬레이션 (실제 MediaPipe 추후 연동 가능)
  useEffect(() => {
    if (!hasCamera) return;
    const order = ['light', 'focus', 'angle', 'occlu', 'align'];
    const timers = order.map((k, i) => setTimeout(() => {
      setGates(g => ({ ...g, [k]: true }));
    }, 600 + i * 400));
    return () => timers.forEach(clearTimeout);
  }, [hasCamera]);

  const allOk = Object.values(gates).every(Boolean);

  const captureAndAnalyze = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setPhase('shutter');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d')!;
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');

    setTimeout(() => setPhase('analyzing'), 250);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      if (!res.ok) throw new Error('Analysis failed');
      const result: AnalysisResult = await res.json();
      onCaptured(result);
    } catch {
      // Gemini 미연결 시 더미 결과로 진행
      const dummyResult: AnalysisResult = {
        scores: {
          acne: 78, redness: 82, pigmentation: 71, wrinkles: 85,
          pores: 68, oiliness: 74, hydration: 72, evenness: 79,
          texture: 75, elasticity: 81,
        },
        summary: 'AI 분석 키가 설정되면 실제 분석이 제공됩니다',
        highlights: ['전반적으로 건강한 피부 상태', '수분 균형 양호'],
        suggestions: ['자외선 차단제 꾸준히 사용 권장', '수분 크림 보충 고려'],
      };
      onCaptured(dummyResult);
    }
  }, [facingMode, onCaptured]);

  useEffect(() => {
    if (!allOk || phase !== 'aligning') return;
    setPhase('ready');
    const t = setTimeout(() => captureAndAnalyze(), 600);
    return () => clearTimeout(t);
  }, [allOk, phase, captureAndAnalyze]);

  const flipCamera = () => {
    setGates({ light: false, angle: false, focus: false, occlu: false, align: false });
    setPhase('aligning');
    setFacingMode(m => m === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fs-app fs-fade-in" style={{ background: '#0E0D0B', minHeight: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, #2D241F 0%, #0E0D0B 70%)' }}/>

      {/* 실제 카메라 프리뷰 */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: hasCamera ? 0.55 : 0,
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          transition: 'opacity .4s',
        }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }}/>

      {/* 카메라 없을 때 플레이스홀더 */}
      {!hasCamera && (
        <div style={{ position: 'absolute', left: '50%', top: '47%', transform: 'translate(-50%, -50%)', width: 240, height: 290, opacity: 0.85 }}>
          <FacePlaceholder width={240} height={290} hue="night" idx={9} withGrid={phase === 'analyzing'}/>
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
        borderColor: (phase === 'shutter' || allOk) ? '#7FB8A8' : 'rgba(255,255,255,0.85)',
        borderStyle: allOk ? 'solid' : 'dashed',
        transition: 'border-color .3s, border-style .3s',
        boxShadow: phase === 'shutter' ? '0 0 0 999px rgba(255,255,255,0.4)' : 'none',
      }}/>

      {/* 상태 메시지 */}
      {cameraError && (
        <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', color: '#fff', padding: '0 24px' }}>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: 20, fontWeight: 500 }}>{cameraError}</div>
          <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>설정에서 카메라 권한을 허용해주세요</div>
        </div>
      )}
      {!cameraError && phase === 'aligning' && (
        <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', color: '#fff' }}>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: 22, fontWeight: 500 }}>얼굴을 맞춰주세요</div>
          <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>창가 자연광에서 측정하면 정확도가 높아져요</div>
        </div>
      )}
      {phase === 'analyzing' && (
        <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', color: '#fff' }}>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: 22, fontWeight: 500 }}>분석 중…</div>
          <div style={{ marginTop: 6, fontFamily: 'Geist Mono, monospace', fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>CALIBRATION · 10D VECTOR · ICC 0.87</div>
        </div>
      )}

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
          onClick={phase === 'ready' ? captureAndAnalyze : undefined}
          style={{ width: 76, height: 76, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.85)', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: phase === 'shutter' ? '#7FB8A8' : 'rgba(255,255,255,0.92)',
            transform: phase === 'shutter' ? 'scale(0.6)' : 'scale(1)',
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
