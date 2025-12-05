import { motion } from 'framer-motion';
import { Trophy, Award, Zap, Sun, Moon, Brain } from 'lucide-react';
import { UserProfile, CognitiveState, ThemeMode } from '../App';
import { Button } from './ui/button';
import { useState } from 'react';
import { BCIConnectionModal } from './BCIConnectionModal';

interface GamificationHeaderProps {
  userProfile: UserProfile;
  cognitiveState: CognitiveState;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export function GamificationHeader({ userProfile, cognitiveState, themeMode, setThemeMode }: GamificationHeaderProps) {
  const xpPercentage = (userProfile.xp / userProfile.xpToNextLevel) * 100;

  const stateColors = {
    attention: 'from-blue-500 to-green-500',
    calm: 'from-amber-500 to-yellow-500',
    drowsiness: 'from-orange-500 to-red-500',
  };

  const themeIcons = {
    light: Sun,
    dark: Moon,
  };

  const [isBCIModalOpen, setBCIModalOpen] = useState(false);

  return (
    <div className={`${
      themeMode === 'light' 
        ? 'bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 border-b border-gray-200' 
        : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-white/10'
    } px-6 py-4`}>
      <div className="flex items-center justify-between">
        {/* Left: Welcome Message */}
        <div>
          <h2 className={themeMode === 'light' ? 'text-gray-700' : 'text-gray-300'}>
            Welcome back, <span className={themeMode === 'light' ? 'text-black' : 'text-white'}>{userProfile.name}</span>
          </h2>
          <p className={`text-xs mt-1 ${themeMode === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>
            {userProfile.userType === 'adhd' ? 'ADHD Optimized Mode' : 'Standard Learning Mode'}
          </p>
        </div>

        {/* Right: Gamification Stats */}
        <div className="flex items-center gap-6">
          {/* BCI Connection Button */}
          <Button
            onClick={() => setBCIModalOpen(true)}
            variant="outline"
            className={`flex items-center gap-2 ${
              themeMode === 'light'
                ? 'border-purple-300 text-purple-700 hover:bg-purple-50'
                : 'border-purple-500/50 text-purple-400 hover:bg-purple-500/20'
            }`}
          >
            <Brain className="w-5 h-5" />
            <span className="hidden md:inline">BCI</span>
          </Button>

          {/* Theme Switcher */}
          <div className={`flex items-center gap-1 p-1 rounded-xl ${
            themeMode === 'light' ? 'bg-gray-200' : 'bg-white/10'
          }`}>
            {(['light', 'dark'] as ThemeMode[]).map((mode) => {
              const Icon = themeIcons[mode];
              return (
                <Button
                  key={mode}
                  onClick={() => setThemeMode(mode)}
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 transition-all ${
                    themeMode === mode
                      ? themeMode === 'light'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'bg-purple-600 text-white'
                      : themeMode === 'light'
                      ? 'text-gray-500 hover:text-gray-900'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
          </div>

          {/* Level */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              themeMode === 'light'
                ? 'bg-purple-100 border border-purple-200'
                : 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30'
            }`}
          >
            <Trophy className={`w-6 h-6 ${themeMode === 'light' ? 'text-yellow-600' : 'text-yellow-400'}`} />
            <div>
              <div className={`text-xs ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Level</div>
              <div className={themeMode === 'light' ? 'text-black' : 'text-white'}>{userProfile.level}</div>
            </div>
          </motion.div>

          {/* XP Progress */}
          <div className="hidden md:block w-48">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Zap className={`w-4 h-4 ${themeMode === 'light' ? 'text-purple-600' : 'text-purple-400'}`} />
                <span className={`text-xs ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>XP</span>
              </div>
              <span className={`text-xs ${themeMode === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>
                {userProfile.xp} / {userProfile.xpToNextLevel}
              </span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${
              themeMode === 'light' ? 'bg-gray-200' : 'bg-gray-700'
            }`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${stateColors[cognitiveState]} shadow-lg`}
                style={{
                  boxShadow: `0 0 10px ${cognitiveState === 'attention' ? '#3b82f6' : cognitiveState === 'calm' ? '#f59e0b' : '#ef4444'}`,
                }}
              />
            </div>
          </div>

          {/* Badges */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              themeMode === 'light'
                ? 'bg-pink-100 border border-pink-200'
                : 'bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30'
            }`}
          >
            <Award className={`w-6 h-6 ${themeMode === 'light' ? 'text-pink-600' : 'text-pink-400'}`} />
            <div>
              <div className={`text-xs ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Badges</div>
              <div className={themeMode === 'light' ? 'text-black' : 'text-white'}>{userProfile.badges}</div>
            </div>
          </motion.div>
        </div>
      </div>
      <BCIConnectionModal isOpen={isBCIModalOpen} onClose={() => setBCIModalOpen(false)} />
    </div>
  );
}