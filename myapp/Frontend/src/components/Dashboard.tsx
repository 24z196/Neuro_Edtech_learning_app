import { motion } from 'framer-motion';
import { Trophy, Award, TrendingUp, Target, Lock } from 'lucide-react';
import { UserProfile, ThemeMode } from '../App';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardProps {
  userProfile: UserProfile;
  themeMode: ThemeMode;
}

const stateDistributionData = [
  { name: 'Attention', value: 45, color: '#3b82f6' },
  { name: 'Calm', value: 30, color: '#f59e0b' },
  { name: 'Drowsiness', value: 25, color: '#ef4444' },
];

const interventionSuccessData = [
  { name: 'Mini Quiz', rate: 85 },
  { name: 'Deep Dive', rate: 92 },
  { name: 'Analogy', rate: 78 },
  { name: 'Breathing', rate: 95 },
  { name: 'Mini Game', rate: 88 },
];

const xpProgressData = [
  { day: 'Mon', xp: 450 },
  { day: 'Tue', xp: 620 },
  { day: 'Wed', xp: 580 },
  { day: 'Thu', xp: 720 },
  { day: 'Fri', xp: 680 },
  { day: 'Sat', xp: 540 },
  { day: 'Sun', xp: 710 },
];

const allBadges = [
  { id: 1, name: 'First Steps', icon: '🎯', unlocked: true, description: 'Complete your first lesson' },
  { id: 2, name: 'Quick Learner', icon: '⚡', unlocked: true, description: 'Score 100% on a quiz' },
  { id: 3, name: 'Week Warrior', icon: '📅', unlocked: true, description: 'Learn 7 days in a row' },
  { id: 4, name: 'Deep Thinker', icon: '🧠', unlocked: true, description: 'Complete 10 deep dives' },
  { id: 5, name: 'Zen Master', icon: '🧘', unlocked: true, description: 'Finish 20 breathing exercises' },
  { id: 6, name: 'Game Champion', icon: '🏆', unlocked: true, description: 'Score 30+ in mini-game' },
  { id: 7, name: 'Analogy King', icon: '💡', unlocked: true, description: 'Create 15 analogies' },
  { id: 8, name: 'Century Club', icon: '💯', unlocked: true, description: 'Earn 10,000 XP' },
  { id: 9, name: 'Night Owl', icon: '🦉', unlocked: true, description: 'Study after midnight' },
  { id: 10, name: 'Morning Glory', icon: '🌅', unlocked: true, description: 'Start learning before 6 AM' },
  { id: 11, name: 'Focus Master', icon: '🎯', unlocked: true, description: 'Stay in attention mode for 2 hours' },
  { id: 12, name: 'Comeback Kid', icon: '💪', unlocked: true, description: 'Complete exercises in drowsy state' },
  { id: 13, name: 'Level 10', icon: '⭐', unlocked: false, description: 'Reach level 10' },
  { id: 14, name: 'Level 25', icon: '🌟', unlocked: false, description: 'Reach level 25' },
  { id: 15, name: 'Level 50', icon: '✨', unlocked: false, description: 'Reach level 50' },
  { id: 16, name: 'Legendary', icon: '👑', unlocked: false, description: 'Reach level 100' },
];

export function Dashboard({ userProfile, themeMode }: DashboardProps) {
  return (
    <div className={`min-h-full p-6 ${
      themeMode === 'light'
        ? 'bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50'
        : 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Performance Dashboard
          </h1>
          <p className={themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}>
            Track your learning journey and achievements
          </p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-2xl border shadow-xl ${
              themeMode === 'light'
                ? 'bg-purple-100 border-purple-300'
                : 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <Trophy className={`w-10 h-10 ${themeMode === 'light' ? 'text-yellow-600' : 'text-yellow-400'}`} />
              <div className={`text-sm ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Current</div>
            </div>
            <div className={`text-3xl mb-1 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              Level {userProfile.level}
            </div>
            <p className={`text-sm ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              Keep climbing!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-2xl border shadow-xl ${
              themeMode === 'light'
                ? 'bg-pink-100 border-pink-300'
                : 'bg-gradient-to-br from-pink-600/20 to-purple-600/20 border-pink-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <Award className={`w-10 h-10 ${themeMode === 'light' ? 'text-pink-600' : 'text-pink-400'}`} />
              <div className={`text-sm ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Earned</div>
            </div>
            <div className={`text-3xl mb-1 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              {userProfile.badges}
            </div>
            <p className={`text-sm ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              Badges unlocked
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 rounded-2xl border shadow-xl ${
              themeMode === 'light'
                ? 'bg-blue-100 border-blue-300'
                : 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className={`w-10 h-10 ${themeMode === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
              <div className={`text-sm ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Total</div>
            </div>
            <div className={`text-3xl mb-1 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              {userProfile.totalXP.toLocaleString()}
            </div>
            <p className={`text-sm ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              Experience points
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-6 rounded-2xl border shadow-xl ${
              themeMode === 'light'
                ? 'bg-orange-100 border-orange-300'
                : 'bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <Target className={`w-10 h-10 ${themeMode === 'light' ? 'text-orange-600' : 'text-orange-400'}`} />
              <div className={`text-sm ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Next Level</div>
            </div>
            <div className={`text-3xl mb-1 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              {userProfile.xp}/{userProfile.xpToNextLevel}
            </div>
            <div className={`mt-2 h-2 rounded-full overflow-hidden ${
              themeMode === 'light' ? 'bg-gray-300' : 'bg-gray-700'
            }`}>
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                style={{ width: `${(userProfile.xp / userProfile.xpToNextLevel) * 100}%` }}
              />
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* State Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className={`p-6 rounded-2xl backdrop-blur-xl border shadow-xl ${
              themeMode === 'light'
                ? 'bg-white border-gray-200'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <h3 className={themeMode === 'light' ? 'text-black mb-4' : 'text-white mb-4'}>
              Cognitive State Distribution
            </h3>
            <p className={`text-sm mb-6 ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              Last 7 days
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stateDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stateDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: themeMode === 'light' ? '#ffffff' : '#1f2937',
                    border: themeMode === 'light' ? '1px solid #d1d5db' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: themeMode === 'light' ? '#000' : '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {stateDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`text-sm ${themeMode === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* XP Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className={`p-6 rounded-2xl backdrop-blur-xl border shadow-xl ${
              themeMode === 'light'
                ? 'bg-white border-gray-200'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <h3 className={themeMode === 'light' ? 'text-black mb-4' : 'text-white mb-4'}>
              Weekly XP Progress
            </h3>
            <p className={`text-sm mb-6 ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              Daily earnings
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={xpProgressData}>
                <XAxis dataKey="day" stroke={themeMode === 'light' ? '#6b7280' : '#9ca3af'} />
                <YAxis stroke={themeMode === 'light' ? '#6b7280' : '#9ca3af'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: themeMode === 'light' ? '#ffffff' : '#1f2937',
                    border: themeMode === 'light' ? '1px solid #d1d5db' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: themeMode === 'light' ? '#000' : '#fff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="xp"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Intervention Success Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`p-6 rounded-2xl backdrop-blur-xl border shadow-xl mb-8 ${
            themeMode === 'light'
              ? 'bg-white border-gray-200'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <h3 className={themeMode === 'light' ? 'text-black mb-4' : 'text-white mb-4'}>
            Intervention Success Rate
          </h3>
          <p className={`text-sm mb-6 ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            Completion percentage by type
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={interventionSuccessData}>
              <XAxis dataKey="name" stroke={themeMode === 'light' ? '#6b7280' : '#9ca3af'} />
              <YAxis stroke={themeMode === 'light' ? '#6b7280' : '#9ca3af'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: themeMode === 'light' ? '#ffffff' : '#1f2937',
                  border: themeMode === 'light' ? '1px solid #d1d5db' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: themeMode === 'light' ? '#000' : '#fff'
                }}
              />
              <Bar dataKey="rate" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Badge Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`p-6 rounded-2xl backdrop-blur-xl border shadow-xl ${
            themeMode === 'light'
              ? 'bg-white border-gray-200'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={themeMode === 'light' ? 'text-black mb-1' : 'text-white mb-1'}>
                Badge Gallery
              </h3>
              <p className={`text-sm ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                {userProfile.badges} of {allBadges.length} unlocked
              </p>
            </div>
            <div className={`text-2xl ${themeMode === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
              {Math.round((userProfile.badges / allBadges.length) * 100)}%
            </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {allBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.02 }}
                className={`relative group ${
                  badge.unlocked ? '' : 'opacity-30'
                }`}
              >
                <div
                  className={`aspect-square rounded-2xl flex items-center justify-center text-4xl ${
                    badge.unlocked
                      ? themeMode === 'light'
                        ? 'bg-gradient-to-br from-yellow-200 to-orange-200 border border-yellow-400'
                        : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                      : themeMode === 'light'
                      ? 'bg-gray-200 border border-gray-300'
                      : 'bg-gray-800 border border-gray-700'
                  }`}
                >
                  {badge.unlocked ? badge.icon : <Lock className={`w-6 h-6 ${
                    themeMode === 'light' ? 'text-gray-400' : 'text-gray-600'
                  }`} />}
                </div>
                
                {/* Tooltip */}
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 ${
                  themeMode === 'light'
                    ? 'bg-white border-gray-300'
                    : 'bg-gray-900 border-white/10'
                }`}>
                  <p className={`text-xs mb-1 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                    {badge.name}
                  </p>
                  <p className={`text-xs ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                    {badge.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}