import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { LearningZone } from './components/LearningZone';
import { Dashboard } from './components/Dashboard';
import Avatar from './components/Avatar';
import { Store } from './components/Store';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { GamificationHeader } from './components/GamificationHeader';
import { MoodEmoji } from './components/MoodEmoji';

export type CognitiveState = 'attention' | 'calm' | 'drowsiness';
export type UserType = 'normal' | 'adhd';
export type Screen = 'login' | 'learning' | 'dashboard' | 'avatar' | 'store' | 'settings';
export type ThemeMode = 'light' | 'dark' | 'dynamic';

export interface UserProfile {
  name: string;
  userType: UserType;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXP: number;
  badges: number;
  coins: number;
  avatar: {
    hair: string;
    eyes: string;
    skinTone: string;
    top: string;
    bottom: string;
    headwear: string;
    eyewear: string;
    footwear: string;
    backpack: string;
    accessories: string[];
  };
  inventory: string[];
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('learning');
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>('attention');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Alex',
    userType: 'normal',
    level: 7,
    xp: 2450,
    xpToNextLevel: 3000,
    totalXP: 15450,
    badges: 12,
    coins: 2500,
    avatar: {
      hair: 'short-modern',
      eyes: 'friendly',
      skinTone: 'medium',
      top: 'hoodie',
      bottom: 'jeans',
      headwear: 'none',
      eyewear: 'none',
      footwear: 'sneakers',
      backpack: 'none',
      accessories: ['bci-headset']
    },
    inventory: ['short-modern', 'long-wavy', 'friendly', 'light', 'medium', 'dark', 'hoodie', 't-shirt', 'bci-headset']
  });

  const handleLogin = (name: string, userType: UserType) => {
    setUserProfile(prev => ({ ...prev, name, userType }));
    setIsLoggedIn(true);
  };

  const addXP = async (amount: number) => {
    try {
      const res = await fetch('http://localhost:5000/api/user/addXP', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userProfile.name, amount })
      });
      if (!res.ok) throw new Error('Failed to persist XP');
      const updated = await res.json();
      setUserProfile(updated);
    } catch {
      // Fallback to local update if backend not available
      setUserProfile(prev => {
        const newXP = prev.xp + amount;
        const newTotalXP = prev.totalXP + amount;
        if (newXP >= prev.xpToNextLevel) {
          return { ...prev, level: prev.level + 1, xp: newXP - prev.xpToNextLevel, xpToNextLevel: prev.xpToNextLevel + 500, totalXP: newTotalXP };
        }
        return { ...prev, xp: newXP, totalXP: newTotalXP };
      });
    }
  };

  const spendXP = (amount: number): boolean => {
    if (userProfile.totalXP >= amount) {
      setUserProfile(prev => ({
        ...prev,
        totalXP: prev.totalXP - amount
      }));
      return true;
    }
    return false;
  };

  // Sync initial XP to localStorage for Store if not present
  useEffect(() => {
    const hasXP = localStorage.getItem('user-xp');
    if (hasXP == null) {
      localStorage.setItem('user-xp', String(userProfile.totalXP));
    }
    // Ensure avatar-state exists
    if (localStorage.getItem('avatar-state') == null) {
      localStorage.setItem('avatar-state', JSON.stringify({
        dress: 'hoodie', shoes: 'sneakers', accessories: 'none', skinColor: '#8d5524'
      }));
    }
  }, []);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden ${themeMode === 'light' ? 'bg-gray-50' : 'bg-black'}`}>
      {/* Mood Emoji Indicator */}
      <MoodEmoji cognitiveState={cognitiveState} />
      
      <Sidebar 
        currentScreen={currentScreen} 
        onNavigate={setCurrentScreen}
        themeMode={themeMode}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <GamificationHeader 
          userProfile={userProfile}
          cognitiveState={cognitiveState}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
        />
        
        <main className="flex-1 overflow-auto">
          {currentScreen === 'learning' && (
            <LearningZone 
              cognitiveState={cognitiveState}
              setCognitiveState={setCognitiveState}
              userType={userProfile.userType}
              userId={userProfile.name}
              addXP={addXP}
              themeMode={themeMode}
            />
          )}
          {currentScreen === 'dashboard' && (
            <Dashboard userProfile={userProfile} themeMode={themeMode} />
          )}
          {currentScreen === 'avatar' && (
            <ErrorBoundary>
              <div className={`p-2 ${themeMode === 'light' ? 'bg-white text-black' : ''}`}>
                <Avatar />
              </div>
            </ErrorBoundary>
          )}
          {currentScreen === 'store' && (
            <ErrorBoundary>
              <Store themeMode={themeMode} userProfile={userProfile as any} setUserProfile={setUserProfile as any} />
            </ErrorBoundary>
          )}
          {currentScreen === 'settings' && (
            <div className={`p-8 ${themeMode === 'light' ? 'bg-white text-black' : ''}`}>
              <h1 className="mb-4">Settings</h1>
              <p className={themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}>Settings panel coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}