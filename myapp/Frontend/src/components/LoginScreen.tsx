import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { UserType } from '../App';
import { Brain, User, Lock, Mail, Sparkles, Zap, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (name: string, userType: UserType) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: ''
  });
  const [userType, setUserType] = useState<UserType>('normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup) {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      if (!formData.name.trim() || !formData.userId.trim() || !formData.password.trim()) {
        alert('Please fill all required fields!');
        return;
      }
    } else {
      if (!formData.email.trim() || !formData.password.trim()) {
        alert('Please enter Email ID and Password!');
        return;
      }
    }
    onLogin(formData.name || formData.email, userType);
  };

  // Generate random colors for falling particles
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Gradient Orbs */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full blur-3xl opacity-20"
            style={{
              width: `${150 + i * 40}px`,
              height: `${150 + i * 40}px`,
              background: `radial-gradient(circle, ${colors[i % colors.length]}, transparent)`,
            }}
            animate={{
              x: [0, Math.sin(i) * 200, -Math.cos(i) * 150, 0],
              y: [0, -Math.cos(i) * 200, Math.sin(i) * 150, 0],
              scale: [1, 1.3, 0.9, 1],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
            initial={{
              left: `${5 + i * 12}%`,
              top: `${5 + i * 11}%`,
            }}
          />
        ))}

        {/* Falling Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: colors[i % colors.length],
              boxShadow: `0 0 20px ${colors[i % colors.length]}`,
            }}
            animate={{
              y: ['0vh', '100vh'],
              x: [0, Math.sin(i * 0.5) * 150],
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.15,
            }}
            initial={{
              left: `${i * 3.3}%`,
              top: '-20px',
            }}
          />
        ))}

        {/* Kinetic Light Trails */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)',
            backgroundSize: '200% 200%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Login/Signup Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="backdrop-blur-2xl bg-gradient-to-br from-gray-900/80 via-purple-900/30 to-blue-900/30 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Logo & Title */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <motion.div 
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 mb-4 shadow-lg shadow-purple-500/50"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(168, 85, 247, 0.5)',
                  '0 0 40px rgba(59, 130, 246, 0.5)',
                  '0 0 20px rgba(236, 72, 153, 0.5)',
                  '0 0 20px rgba(168, 85, 247, 0.5)',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Brain className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              BrainBuddy
            </h1>
            <p className="text-gray-300">Adaptive Learning Powered by AI</p>
          </motion.div>

          {/* Toggle Login/Signup */}
          <div className="flex gap-2 mb-6 p-1 bg-black/30 rounded-xl">
            <button
              type="button"
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-3 rounded-lg transition-all ${
                !isSignup
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-3 rounded-lg transition-all ${
                isSignup
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Name Input */}
                  <div className="mb-4">
                    <label className="flex mb-2 text-sm text-gray-300 items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="mb-4">
                    <label className="flex mb-2 text-sm text-gray-300 items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email ID Input */}
            <div>
              <label className="flex mb-2 text-sm text-gray-300 items-center gap-2">
                <Mail className="w-4 h-4" />
                Email ID
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email ID"
                className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="flex mb-2 text-sm text-gray-300 items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Confirm Password Input */}
                  <div>
                    <label className="flex mb-2 text-sm text-gray-300 items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm your password"
                      className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* User Type Selection */}
            <div>
              <label className="block mb-3 text-sm text-gray-300">Learning Profile</label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  onClick={() => setUserType('normal')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userType === 'normal'
                      ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/30'
                      : 'border-white/20 bg-black/30'
                  }`}
                >
                  <Sparkles className={`w-6 h-6 mx-auto mb-2 ${
                    userType === 'normal' ? 'text-blue-400' : 'text-gray-400'
                  }`} />
                  <div className={`text-sm ${
                    userType === 'normal' ? 'text-blue-300' : 'text-gray-400'
                  }`}>
                    Normal User
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setUserType('adhd')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userType === 'adhd'
                      ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                      : 'border-white/20 bg-black/30'
                  }`}
                >
                  <Zap className={`w-6 h-6 mx-auto mb-2 ${
                    userType === 'adhd' ? 'text-purple-400' : 'text-gray-400'
                  }`} />
                  <div className={`text-sm ${
                    userType === 'adhd' ? 'text-purple-300' : 'text-gray-400'
                  }`}>
                    ADHD User
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white rounded-xl shadow-lg shadow-purple-500/40 transition-all"
              >
                {isSignup ? 'Create Account' : 'Login to Continue'}
              </Button>
            </motion.div>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            {isSignup 
              ? 'By signing up, you agree to our Terms of Service' 
              : 'Your personalized learning experience awaits'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
