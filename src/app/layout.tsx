import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FitSkin — 매일 측정으로 피부 변화를 증명하는 모바일 웹',
  description: '매일 30초 측정으로 10가지 피부 차원을 시계열 추적. AI 맞춤 Top 10 추천으로 검증된 제품을 만나는 플랫폼.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#F6F2EC', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
