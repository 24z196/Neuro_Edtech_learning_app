import { MoodChanger } from './MoodChanger';
import { ThemeToggle } from './ThemeToggle';
import { User } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { motion } from 'motion/react';

export function TopRightStateControl() {
  const { themeColors, avatarColor } = useTheme();

  return (
    <div className="flex items-center gap-3">
      {/* Theme Toggle - hidden on mobile, shown in settings */}
      <div className="hidden lg:block">
        <ThemeToggle />
      </div>

      {/* Mood Changer */}
      <MoodChanger />

      {/* User Avatar */}
      <motion.button
        className="w-10 h-10 rounded-full flex items-center justify-center border-2 relative overflow-hidden"
        style={{
          backgroundColor: themeColors.surfaceElev1,
          borderColor: themeColors.primaryAccent,
        }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        title="User profile"
      >
        {/* Glowing background */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${themeColors.primaryAccent}30, transparent)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <User className="w-5 h-5 relative z-10" style={{ color: avatarColor }} />
      </motion.button>
    </div>
  );
}
