import { motion } from 'framer-motion';
import { Brain, MessageSquare, LayoutDashboard, Store as StoreIcon, User, Settings } from 'lucide-react';
import { Screen, ThemeMode } from '../App';

interface SidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  themeMode: ThemeMode;
  onShowHistory?: () => void;
}

const navItems = [
  { id: 'learning' as Screen, icon: Brain, label: 'Learning Zone' },
  { id: 'dashboard' as Screen, icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'settings' as Screen, icon: Settings, label: 'Settings' },
];

export function Sidebar({ currentScreen, onNavigate, themeMode, onShowHistory }: SidebarProps) {
  return (
    <div className={`w-20 lg:w-64 border-r flex flex-col ${themeMode === 'light'
        ? 'bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 border-gray-200'
        : 'bg-gradient-to-b from-gray-900 via-gray-900 to-black border-white/10'
      }`}>
      {/* Logo */}
      <div className={`p-6 border-b ${themeMode === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
        <div className="hidden lg:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            BrainBuddy
          </span>
        </div>
        <div className="lg:hidden flex justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                ? themeMode === 'light'
                  ? 'bg-purple-100 border border-purple-300 shadow-md'
                  : 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                : themeMode === 'light'
                  ? 'hover:bg-gray-200'
                  : 'hover:bg-white/5'
                }`}
            >
              <Icon className={`w-6 h-6 flex-shrink-0 ${isActive
                ? themeMode === 'light' ? 'text-purple-600' : 'text-purple-400'
                : themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`} />
              <span className={`hidden lg:block text-sm ${isActive
                ? themeMode === 'light' ? 'text-black' : 'text-white'
                : themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Chat History (placeholder) */}
      <div className={`p-4 border-t ${themeMode === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShowHistory}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${themeMode === 'light' ? 'hover:bg-gray-200' : 'hover:bg-white/5'
            }`}
        >
          <MessageSquare className={`w-6 h-6 flex-shrink-0 ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`} />
          <span className={`hidden lg:block text-sm ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
            Chat History
          </span>
        </motion.button>
      </div>
    </div>
  );
}