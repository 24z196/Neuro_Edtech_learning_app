import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { LearningZone } from './components/LearningZone';
import { Dashboard } from './components/Dashboard';
import { Profile } from './components/Profile';
import { Sidebar } from './components/Sidebar';
import { GamificationHeader } from './components/GamificationHeader';
import { MoodEmoji } from './components/MoodEmoji';

export type CognitiveState = 'attention' | 'calm' | 'drowsiness';
export type UserType = 'normal' | 'adhd';
export type Screen = 'login' | 'learning' | 'dashboard' | 'profile' | 'store' | 'settings';
export type ThemeMode = 'light' | 'dark';

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
  // Force login page to appear by setting isLoggedIn to false
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [currentScreen, setCurrentScreen] = useState<Screen>('learning');
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>('attention');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved
      ? JSON.parse(saved)
      : {
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
          inventory: [
            'short-modern',
            'long-wavy',
            'friendly',
            'light',
            'medium',
            'dark',
            'hoodie',
            't-shirt',
            'bci-headset'
          ]
        };
  });

  // SETTINGS STATE
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notificationsEnabled') === 'true';
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') === 'true';
  });

  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>(() => {
    return (localStorage.getItem('fontSize') as any) || 'normal';
  });

  // NEW — SOUND RANGE
  const [soundVolume, setSoundVolume] = useState(() => {
    return Number(localStorage.getItem('soundVolume') || 70);
  });

  // NEW — NOTIFICATION SOUND RANGE
  const [notificationVolume, setNotificationVolume] = useState(() => {
    return Number(localStorage.getItem('notificationVolume') || 70);
  });

  useEffect(() => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
    localStorage.setItem('soundEnabled', soundEnabled.toString());
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('soundVolume', soundVolume.toString());
    localStorage.setItem('notificationVolume', notificationVolume.toString());
  }, [notificationsEnabled, soundEnabled, fontSize, soundVolume, notificationVolume]);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    if (isLoggedIn) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
  }, [isLoggedIn, userProfile]);

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

      return { ...prev, xp: newXP, totalXP: newTotalXP };
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

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden ${themeMode === 'light' ? 'bg-gray-50' : 'bg-black'}`}>
      <MoodEmoji cognitiveState={cognitiveState} />

      <Sidebar currentScreen={currentScreen} onNavigate={setCurrentScreen} themeMode={themeMode} />

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

          {currentScreen === 'dashboard' && <Dashboard userProfile={userProfile} themeMode={themeMode} />}

          {currentScreen === 'profile' && (
            <Profile
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              onNavigateToStore={() => setCurrentScreen('store')}
              themeMode={themeMode}
            />
          )}

          {/* ⭐ UPDATED SETTINGS ⭐ */}
          {currentScreen === 'settings' && (
            <div className={`p-8 ${themeMode === 'light' ? 'bg-white' : ''}`}>
              <h1 className="mb-4 text-2xl font-bold bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
                Settings
              </h1>

              {/* APPEARANCE */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
                  Appearance
                </h2>
                <label className="flex items-center gap-3 cursor-pointer bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
                  <input
                    type="checkbox"
                    checked={themeMode === 'dark'}
                    onChange={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                  />
                  Dark Mode
                </label>
              </div>

              {/* NOTIFICATIONS */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
                  Notifications
                </h2>

                <label className="flex items-center gap-3 cursor-pointer bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                  />
                  Enable Notifications
                </label>

                {/* NEW NOTIFICATION VOLUME SLIDER */}
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-1 bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
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

              {/* SOUND */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
                  Sound
                </h2>

                <label className="flex items-center gap-3 cursor-pointer bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={() => setSoundEnabled(!soundEnabled)}
                  />
                  Enable Sound Effects
                </label>

                {/* NEW SOUND RANGE */}
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-1 bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
                    Sound Volume: {soundVolume}%
                  </p>
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