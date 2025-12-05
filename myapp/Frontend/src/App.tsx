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
type FontSize = 'small' | 'normal' | 'large';

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
  // Initialize state from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [currentScreen, setCurrentScreen] = useState<Screen>('learning');
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>('attention');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notificationsEnabled') === 'true';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') === 'true';
  });
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('fontSize') as FontSize) || 'normal';
  });
  const [soundVolume, setSoundVolume] = useState(() => {
    return Number(localStorage.getItem('soundVolume') || 70);
  });
  const [notificationVolume, setNotificationVolume] = useState(() => {
    return Number(localStorage.getItem('notificationVolume') || 70);
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : {
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
    };
  });

  // Persist login state and user profile to localStorage
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    if (isLoggedIn) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
  }, [isLoggedIn, userProfile]);

  useEffect(() => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
    localStorage.setItem('soundEnabled', soundEnabled.toString());
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('soundVolume', soundVolume.toString());
    localStorage.setItem('notificationVolume', notificationVolume.toString());
  }, [notificationsEnabled, soundEnabled, fontSize, soundVolume, notificationVolume]);

  const handleLogin = (name: string, userType: UserType) => {
    setUserProfile(prev => ({ ...prev, name, userType }));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
  };

  const addXP = (amount: number) => {
    setUserProfile(prev => {
      const newXP = prev.xp + amount;
      const newTotalXP = prev.totalXP + amount;

      if (newXP >= prev.xpToNextLevel) {
        return {
          ...prev,
          level: prev.level + 1,
          xp: newXP - prev.xpToNextLevel,
          xpToNextLevel: prev.xpToNextLevel + 500,
          totalXP: newTotalXP
        };
      }

      return {
        ...prev,
        xp: newXP,
        totalXP: newTotalXP
      };
    });
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

  // Map Store updates (partial profile) back into the full user profile shape
  const handleStoreProfileUpdate = (updated: { name: string; xp: number; totalXP: number; inventory: string[]; avatar: { top?: string; hair?: string; footwear?: string } }) => {
    setUserProfile(prev => ({
      ...prev,
      name: updated.name ?? prev.name,
      xp: updated.xp ?? prev.xp,
      totalXP: updated.totalXP ?? prev.totalXP,
      inventory: updated.inventory ?? prev.inventory,
      avatar: { ...prev.avatar, ...updated.avatar }
    }));
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
        onShowHistory={() => setHistoryOpen(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <GamificationHeader
          userProfile={userProfile}
          cognitiveState={cognitiveState}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          onLogout={handleLogout}
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
              historyOpen={historyOpen}
              onOpenHistory={() => setHistoryOpen(true)}
              onCloseHistory={() => setHistoryOpen(false)}
            />
          )}
          {currentScreen === 'dashboard' && (
            <Dashboard userProfile={userProfile} themeMode={themeMode} />
          )}
          {currentScreen === 'store' && (
            <Store
              userProfile={userProfile}
              setUserProfile={handleStoreProfileUpdate}
              themeMode={themeMode === 'light' ? 'light' : 'dark'}
            />
          )}
          {currentScreen === 'settings' && (
            <div className={`p-8 ${themeMode === 'light' ? 'bg-white text-black' : 'text-white'}`}>
              <h1 className="mb-4 text-2xl font-bold bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
                Settings
              </h1>

              {/* Appearance */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
                  Appearance
                </h2>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={themeMode === 'dark'}
                    onChange={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                  />
                  <span>Dark Mode</span>
                </label>

                <div className="mt-3">
                  <p className="text-sm font-semibold mb-1">Font Size: {fontSize}</p>
                  <div className="flex gap-2">
                    {(['small', 'normal', 'large'] as FontSize[]).map(size => (
                      <button
                        key={size}
                        className={`px-3 py-1 rounded border ${fontSize === size ? 'border-blue-500 text-blue-500' : 'border-gray-400 text-gray-500'}`}
                        onClick={() => setFontSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
                  Notifications
                </h2>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                  />
                  <span>Enable Notifications</span>
                </label>

                <div className="mt-3">
                  <p className="text-sm font-semibold mb-1">
                    Notification Sound Volume: {notificationVolume}%
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={notificationVolume}
                    onChange={e => setNotificationVolume(Number(e.target.value))}
                    className="w-64"
                  />
                </div>
              </div>

              {/* Sound */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
                  Sound
                </h2>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={() => setSoundEnabled(!soundEnabled)}
                  />
                  <span>Enable Sound Effects</span>
                </label>

                <div className="mt-3">
                  <p className="text-sm font-semibold mb-1">Sound Volume: {soundVolume}%</p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundVolume}
                    onChange={e => setSoundVolume(Number(e.target.value))}
                    className="w-64"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}