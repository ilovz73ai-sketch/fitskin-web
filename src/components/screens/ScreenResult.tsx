'use client';
import { SERIES, TODAY_IDX, TODAY_SCORE, YDAY_SCORE } from '@/lib/data';
import { Icon } from '../primitives/icons';
import { ScoreRing } from '../primitives/ScoreRing';

const YESTERDAY_IDX = 26;

const DIM_KEYS = ['acne', 'redness', 'pigmentation', 'wrinkles', 'pores', 'oiliness', 'hydration', 'evenness', 'texture', 'elasticity'];

interface AnalysisResult {
  scores: Record<string, number>;
  summary: string;
  highlights: string[];
  suggestions: string[];
}

export function ScreenResult({ onDone, analysisResult }: { onDone: () => void; analysisResult?: AnalysisResult }) {
  const hasAI = !!analysisResult;

  const composite = hasAI
    ? Math.round(Object.values(analysisResult!.scores).reduce((a, b) => a + b, 0) / Object.values(analysisResult!.scores).length)
    : TODAY_SCORE;

  const delta = composite - YDAY_SCORE;
  const now = new Date();
  const timestamp = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  return (
    <div className="fs-app fs-fade-in" style={{ background: 'var(--fs-bg)', minHeight: '100%', paddingBottom: 30 }}>
      <div style={{ padding: '70px 20px 0' }}>
        <div className="fs-eyebrow">측정 · {timestamp}</div>
        <div className="fs-h1" style={{ marginTop: 6 }}>오늘의 결과</div>
        <div className="fs-body" style={{ marginTop: 6, fontSize: 14 }}>
          {hasAI
            ? <span>AI 피부 분석 완료 · <span className="fs-mono" style={{ color: 'var(--fs-ink)' }}>10D 벡터</span></span>
            : <span>ICC 품질 점수 <span className="fs-mono" style={{ color: 'var(--fs-ink)' }}>0.91</span> · 14초 만에 측정 완료</span>}
        </div>
      </div>

      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'center' }}>
        <div className="fs-card fs-grain" style={{ width: '100%', padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ScoreRing score={composite} delta={delta} size={150}/>
          <div style={{ marginTop: 14, fontFamily: 'Newsreader, serif', fontSize: 18, fontWeight: 500, textAlign: 'center', lineHeight: 1.4 }}>
            {hasAI
              ? <span style={{ color: 'var(--fs-mint-ink)' }}>{analysisResult!.summary}</span>
              : <><span style={{ color: 'var(--fs-mint-ink)' }}>꽤 좋아졌어요.</span><br/>여드름 −3, 수분 +5</>}
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="fs-h2">10차원 피부 벡터</div>
          <span className="fs-pill">v3.2.1</span>
        </div>
        <div className="fs-card" style={{ padding: '4px 16px' }}>
          {SERIES.map((d, i) => {
            const aiKey = DIM_KEYS[i];
            const v = hasAI ? (analysisResult!.scores[aiKey] ?? d.values[TODAY_IDX]) : d.values[TODAY_IDX];
            const yv = d.values[YESTERDAY_IDX];
            const dl = Math.round(v - yv);
            const better = d.good === 'high' ? dl > 0 : dl < 0;
            return (
              <div key={d.key} className="fs-dim-row" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--fs-line-2)' }}>
                <div style={{ width: 80, fontSize: 13, fontWeight: 500 }}>{d.label}</div>
                <div className="fs-dim-bar"><span style={{ width: `${v}%`, background: d.color }}/></div>
                <div className="fs-num" style={{ width: 30, textAlign: 'right', fontSize: 16 }}>{v}</div>
                <div className="fs-mono" style={{ width: 36, textAlign: 'right', fontSize: 11, color: dl === 0 ? 'var(--fs-ink-3)' : (better ? 'var(--fs-mint-ink)' : 'var(--fs-coral-ink)') }}>
                  {dl > 0 ? '+' : ''}{dl}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <div className="fs-card-flat" style={{ borderLeft: '3px solid #E8907E', padding: 18 }}>
          <div className="fs-eyebrow" style={{ color: '#B8513C', marginBottom: 6 }}>오늘의 인사이트</div>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: 17, lineHeight: 1.4, fontWeight: 500 }}>
            {hasAI && analysisResult!.suggestions.length > 0
              ? analysisResult!.suggestions[0]
              : 'T존 유분이 평소보다 12% 높아요. 잠들기 전 가벼운 클렌징을 추가해보면 어떨까요?'}
          </div>
          {hasAI && analysisResult!.highlights.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {analysisResult!.highlights.map((h, i) => (
                <span key={i} className="fs-pill fs-pill-mint">{h}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <div className="fs-card" style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          {Icon.bell('#1B1A17')}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>내일도 같은 시간에 알림 받기</div>
            <div className="fs-caption" style={{ marginTop: 2 }}>매일 측정해야 변화를 정확히 볼 수 있어요</div>
          </div>
          <div style={{ width: 44, height: 26, background: '#1B1A17', borderRadius: 999, position: 'relative' }}>
            <div style={{ position: 'absolute', right: 2, top: 2, width: 22, height: 22, background: '#fff', borderRadius: '50%' }}/>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0', display: 'flex', gap: 10 }}>
        <button className="fs-btn fs-btn-ghost" style={{ flex: 1 }}>{Icon.share('#1B1A17')}<span>공유</span></button>
        <button className="fs-btn fs-btn-primary" style={{ flex: 2 }} onClick={onDone}>트렌드에서 보기</button>
      </div>
    </div>
  );
}
