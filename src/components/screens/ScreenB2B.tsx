'use client';

export function ScreenB2B() {
  const series7 = [120, 142, 138, 156, 174, 168, 192];
  const max = Math.max(...series7);
  return (
    <div className="fs-app fs-fade-in" style={{ background: '#FBF8F3', minHeight: '100%', paddingBottom: 30 }}>
      <div style={{ padding: '60px 18px 0' }}>
        <div className="fs-mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--fs-ink-3)' }}>BUSINESS · GLOW LAB</div>
        <div className="fs-h1" style={{ fontSize: 24, marginTop: 4 }}>위젯 측정 대시보드</div>
        <div className="fs-body" style={{ fontSize: 12, marginTop: 4 }}>최근 7일 · Tier A 데이터</div>
      </div>

      <div style={{ padding: '16px 18px 0', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {[{ k: '총 측정', v: '1,084', d: '+12%', col: '#2F7A66' }, { k: '구매 전환율', v: '8.4%', d: '+2.1pt', col: '#2F7A66' }, { k: '재방문율 (D7)', v: '34%', d: '−1pt', col: '#B8513C' }, { k: 'API 호출', v: '14.2k', d: '+8%', col: '#2F7A66' }].map((s, i) => (
          <div key={i} className="fs-card" style={{ padding: 14 }}>
            <div className="fs-eyebrow" style={{ marginBottom: 4 }}>{s.k}</div>
            <div className="fs-num" style={{ fontSize: 26, fontWeight: 500 }}>{s.v}</div>
            <div className="fs-mono" style={{ fontSize: 11, color: s.col, marginTop: 2 }}>{s.d}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '14px 18px 0' }}>
        <div className="fs-card" style={{ padding: 16 }}>
          <div className="fs-eyebrow" style={{ marginBottom: 8 }}>일별 측정 건수</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
            {series7.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', height: (v / max) * 90, background: i === 6 ? '#E8907E' : '#1B1A17', borderRadius: 4 }}/>
                <div className="fs-mono" style={{ fontSize: 9, color: 'var(--fs-ink-3)' }}>{['월','화','수','목','금','토','일'][i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 18px 0' }}>
        <div className="fs-card" style={{ padding: 16 }}>
          <div className="fs-eyebrow" style={{ marginBottom: 10 }}>세그먼트 분포</div>
          {[{ l: '20대 여성 / 지성', v: 412, p: 38 }, { l: '30대 여성 / 복합성', v: 287, p: 26 }, { l: '20대 여성 / 건성', v: 198, p: 18 }, { l: '기타', v: 187, p: 18 }].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid var(--fs-line-2)' }}>
              <div style={{ flex: 1, fontSize: 12 }}>{r.l}</div>
              <div className="fs-dim-bar" style={{ width: 80 }}><span style={{ width: `${r.p}%`, background: '#1B1A17' }}/></div>
              <div className="fs-num" style={{ fontSize: 14, width: 36, textAlign: 'right' }}>{r.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 18px 0' }}>
        <div className="fs-card" style={{ padding: 16 }}>
          <div className="fs-eyebrow" style={{ marginBottom: 10 }}>수익 채널 · 3종</div>
          {[{ l: '임베딩 위젯 SaaS', r: '월 50~200만 원', sub: '자사몰 1줄 삽입' }, { l: 'Product Impact Report', r: '건당 300~500만 원', sub: '리얼월드 임상 대체 · 전통 대비 1/10 비용' }, { l: '트렌드 인사이트 DaaS', r: '월 100만 원', sub: '연령·부위별 집계 데이터 구독' }].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--fs-line-2)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.l}</div>
                <div className="fs-caption" style={{ marginTop: 2 }}>{r.sub}</div>
              </div>
              <div className="fs-mono" style={{ fontSize: 11, color: 'var(--fs-mint-ink)', whiteSpace: 'nowrap' }}>{r.r}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 18px 0' }}>
        <div className="fs-card" style={{ padding: 16, background: '#1B1A17', color: '#fff' }}>
          <div className="fs-mono" style={{ fontSize: 10, letterSpacing: '0.1em', opacity: 0.7, marginBottom: 8 }}>EMBED · 1줄 삽입</div>
          <div className="fs-mono" style={{ fontSize: 11, lineHeight: 1.5, color: '#7FB8A8', wordBreak: 'break-all' }}>
            &lt;script src=&quot;//cdn.fitskin.app/w.js&quot;<br/>data-key=&quot;gl_a8f2…3c&quot;&gt;&lt;/script&gt;
          </div>
          <div style={{ marginTop: 10, fontSize: 11, opacity: 0.8 }}>gzipped 76KB · 글로벌 CDN · 30초 배포</div>
        </div>
      </div>
    </div>
  );
}
