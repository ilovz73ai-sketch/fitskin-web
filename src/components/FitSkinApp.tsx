'use client';
import { useState, useEffect } from 'react';
import { TabBar } from './primitives/TabBar';
import { ScreenOnboard } from './screens/ScreenOnboard';
import { ScreenHome } from './screens/ScreenHome';
import { ScreenCamera } from './screens/ScreenCamera';
import { ScreenResult } from './screens/ScreenResult';
import { ScreenTrend } from './screens/ScreenTrend';
import { ScreenRoutine } from './screens/ScreenRoutine';
import { ScreenMe } from './screens/ScreenMe';
import { ScreenB2B } from './screens/ScreenB2B';
import { getStoredUser, signOut } from '@/lib/auth';
import type { FsUser } from '@/lib/auth';

type Screen = 'onboard' | 'home' | 'camera' | 'result' | 'trend' | 'routine' | 'me' | 'b2b';
const TAB_SCREENS: Screen[] = ['home', 'trend', 'routine', 'me'];

interface AnalysisResult {
  scores: Record<string, number>;
  summary: string;
  highlights: string[];
  suggestions: string[];
}

export function FitSkinApp({ initialScreen = 'onboard' }: { initialScreen?: Screen }) {
  const [user, setUser] = useState<FsUser | null>(null);
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | undefined>();

  useEffect(() => {
    const u = getStoredUser();
    if (u) {
      setUser(u);
      setScreen('home');
    }
  }, []);

  const nav = (s: string) => setScreen(s as Screen);

  const handleCaptured = (result?: AnalysisResult) => {
    setAnalysisResult(result);
    nav('result');
  };

  const handleSignOut = () => {
    signOut();
    setUser(null);
    setScreen('onboard');
  };

  let body: React.ReactNode;
  switch (screen) {
    case 'onboard': body = <ScreenOnboard onStart={() => nav('home')}/>; break;
    case 'home':    body = <ScreenHome onCapture={() => nav('camera')} onNav={nav}/>; break;
    case 'camera':  body = <ScreenCamera onClose={() => nav('home')} onCaptured={handleCaptured}/>; break;
    case 'result':  body = <ScreenResult onDone={() => nav('trend')} analysisResult={analysisResult}/>; break;
    case 'trend':   body = <ScreenTrend onNav={nav}/>; break;
    case 'routine': body = <ScreenRoutine/>; break;
    case 'me':      body = <ScreenMe user={user} onSignOut={handleSignOut}/>; break;
    case 'b2b':     body = <ScreenB2B/>; break;
    default:        body = <ScreenHome onCapture={() => nav('camera')} onNav={nav}/>;
  }

  const showTabBar = TAB_SCREENS.includes(screen);

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ flex: 1, position: 'relative', paddingBottom: showTabBar ? 80 : 0 }}>
        {body}
      </div>
      {showTabBar && (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, zIndex: 30 }}>
          <TabBar active={screen} onChange={nav}/>
        </div>
      )}
    </div>
  );
}
