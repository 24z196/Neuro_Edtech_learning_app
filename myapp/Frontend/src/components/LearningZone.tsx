import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Link2, Camera, Brain, Wind, Gamepad2, BookOpen, Lightbulb, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { CognitiveState, UserType, ThemeMode } from '../App';
import { MiniQuizModal } from './interventions/MiniQuizModal';
import { DeeperDiveModal } from './interventions/DeeperDiveModal';
import { AnalogyCreatorModal } from './interventions/AnalogyCreatorModal';
import { BreathingExerciseModal } from './interventions/BreathingExerciseModal';
import { MiniGameModal } from './interventions/MiniGameModal';

interface LearningZoneProps {
  cognitiveState: CognitiveState;
  setCognitiveState: (state: CognitiveState) => void;
  userType: UserType;
  userId: string;
  addXP: (amount: number) => void;
  themeMode: ThemeMode;
}

export function LearningZone({ cognitiveState, setCognitiveState, userType, addXP, themeMode, userId }: LearningZoneProps) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hello! I\'m BrainBuddy, your adaptive learning companion. What would you like to learn today?' }
  ]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Send message to backend and update chat
  const sendMessageToBackend = async (msg: string) => {
    setChatHistory(prev => [...prev, { role: 'user', content: msg }]);
    setMessage('');
    try {
      const res = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          profile: userType,
          state: cognitiveState,
          userId
        })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply || '(No response)' }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error contacting backend.' }]);
    }
  };
  const stateThemes = {
    attention: {
      bg:
        themeMode === 'dynamic'
          ? 'from-blue-950 via-gray-900 to-green-950'
          : themeMode === 'light'
          ? 'from-blue-50 via-gray-50 to-green-50'
          : 'from-blue-950 via-gray-900 to-green-950',
      accent: 'from-blue-500 to-green-500',
      glow: 'shadow-blue-500/20',
      border: themeMode === 'light' ? 'border-blue-300' : 'border-blue-500/30',
    },
    calm: {
      bg: themeMode === 'dynamic'
        ? 'from-amber-950 via-gray-900 to-yellow-950'
        : themeMode === 'light'
        ? 'from-amber-50 via-gray-50 to-yellow-50'
        : 'from-amber-950 via-gray-900 to-yellow-950',
      accent: 'from-amber-500 to-yellow-500',
      glow: 'shadow-amber-500/20',
      border: themeMode === 'light' ? 'border-amber-300' : 'border-amber-500/30',
    },
    drowsiness: {
      bg: themeMode === 'dynamic'
        ? 'from-orange-950 via-gray-900 to-red-950'
        : themeMode === 'light'
        ? 'from-orange-50 via-gray-50 to-red-50'
        : 'from-orange-950 via-gray-900 to-red-950',
      accent: 'from-orange-500 to-red-500',
      glow: 'shadow-orange-500/20',
      border: themeMode === 'light' ? 'border-orange-300' : 'border-orange-500/30',
    },
  };

  const theme = stateThemes[cognitiveState];

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageToBackend(message);
    }
  };

  const interventions = {
    attention: [
      {
        id: 'mini-quiz',
        icon: HelpCircle,
        label: 'Take Mini Quiz',
        description: 'Test your understanding',
        color: 'from-blue-600 to-cyan-600',
      },
      {
        id: 'deeper-dive',
        icon: BookOpen,
        label: 'Deeper Dive',
        description: 'Explore this topic further',
        color: 'from-green-600 to-teal-600',
      },
    ],
    calm: [
      {
        id: 'analogy-creator',
        icon: Lightbulb,
        label: 'Analogy Creator',
        description: 'Make connections',
        color: 'from-amber-600 to-yellow-600',
      },
    ],
    drowsiness: [
      {
        id: 'ambient-music',
        icon: Wind,
        label: isPlayingMusic ? 'Stop Ambient Music' : 'Start Ambient Music',
        description: 'Focus with calming sounds',
        color: 'from-orange-600 to-pink-600',
      },
      {
        id: 'breathing-exercise',
        icon: Wind,
        label: 'Breathing Exercise',
        description: 'Re-energize yourself',
        color: 'from-red-600 to-orange-600',
      },
      {
        id: 'mini-game',
        icon: Gamepad2,
        label: 'Start Mini-Game',
        description: 'Quick mental boost',
        color: 'from-purple-600 to-red-600',
      },
    ],
  };

  return (
    <motion.div
      key={cognitiveState}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-full bg-gradient-to-br ${theme.bg} p-6`}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* State Control Panel */}
        <div className={`${
          themeMode === 'light' ? 'bg-white/90' : 'bg-white/5'
        } backdrop-blur-xl border ${theme.border} rounded-2xl p-6 shadow-2xl ${theme.glow}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Brain className={`w-8 h-8 ${themeMode === 'light' ? 'text-purple-600' : 'text-purple-400'}`} />
              <h2 className={themeMode === 'light' ? 'text-black' : 'text-white'}>Cognitive State</h2>
            </div>
            <div className={`text-sm ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              {userType === 'adhd' ? 'ADHD Optimized' : 'Standard Mode'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(['attention', 'calm', 'drowsiness'] as CognitiveState[]).map((state) => (
              <motion.button
                key={state}
                onClick={() => setCognitiveState(state)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 py-4 rounded-xl border-2 transition-all capitalize ${
                  cognitiveState === state
                    ? `bg-gradient-to-r ${stateThemes[state].accent} border-white/30 shadow-lg text-white`
                    : themeMode === 'light'
                    ? 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                {state}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Intervention Buttons */}
        <div className="flex-shrink-0">
          <h3 className={`mb-3 px-6 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Recommended Interventions</h3>
          <div className="flex space-x-3 overflow-x-auto pb-4 px-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {interventions[cognitiveState].map((intervention) => {
              const Icon = intervention.icon;
              return (
                <motion.button
                  key={intervention.id}
                  onClick={() => {
                    if (intervention.id === 'ambient-music') {
                      setIsPlayingMusic(!isPlayingMusic);
                    } else {
                      setActiveModal(intervention.id);
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${intervention.color} text-white shadow-md`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{intervention.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Chat Interface */}
        <div className={`${
          themeMode === 'light' ? 'bg-white/90' : 'bg-white/5'
        } backdrop-blur-xl border ${theme.border} rounded-2xl shadow-2xl ${theme.glow} flex flex-col h-[500px]`}>
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {chatHistory.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? `bg-gradient-to-r ${theme.accent} text-white`
                        : themeMode === 'light'
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-white/10 text-gray-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input Bar */}
          <div className={`border-t p-4 ${themeMode === 'light' ? 'border-gray-300' : 'border-white/10'}`}>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={themeMode === 'light' ? 'text-gray-600 hover:text-black' : 'text-gray-400 hover:text-white'}
                >
                  <Paperclip className="w-6 h-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={themeMode === 'light' ? 'text-gray-600 hover:text-black' : 'text-gray-400 hover:text-white'}
                >
                  <Link2 className="w-6 h-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={themeMode === 'light' ? 'text-gray-600 hover:text-black' : 'text-gray-400 hover:text-white'}
                >
                  <Camera className="w-6 h-6" />
                </Button>
              </div>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                  themeMode === 'light'
                    ? 'bg-gray-100 border-gray-300 text-black placeholder-gray-500'
                    : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                }`}
              />

              <Button
                onClick={handleSendMessage}
                className={`bg-gradient-to-r ${theme.accent} hover:opacity-90 text-white px-6`}
              >
                <Send className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <MiniQuizModal
        isOpen={activeModal === 'mini-quiz'}
        onClose={() => setActiveModal(null)}
        addXP={addXP}
      />
      <DeeperDiveModal
        isOpen={activeModal === 'deeper-dive'}
        onClose={() => setActiveModal(null)}
        addXP={addXP}
      />
      <AnalogyCreatorModal
        isOpen={activeModal === 'analogy-creator'}
        onClose={() => setActiveModal(null)}
        addXP={addXP}
      />
      <BreathingExerciseModal
        isOpen={activeModal === 'breathing-exercise'}
        onClose={() => setActiveModal(null)}
        addXP={addXP}
      />
      <MiniGameModal
        isOpen={activeModal === 'mini-game'}
        onClose={() => setActiveModal(null)}
        addXP={addXP}
      />
    </motion.div>
  );
}