import { motion } from 'framer-motion';
import { CognitiveState } from '../App';

interface MoodEmojiProps {
  cognitiveState: CognitiveState;
}

export function MoodEmoji({ cognitiveState }: MoodEmojiProps) {
  const emojiMap = {
    attention: '😊',
    calm: '😌',
    drowsiness: '😴',
  };

  const colorMap = {
    attention: '#3b82f6',
    calm: '#10b981',
    drowsiness: '#f59e0b',
  };

  const emoji = emojiMap[cognitiveState];
  const color = colorMap[cognitiveState];

  return (
    <motion.div
      className="fixed top-6 right-6 z-50"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ 
        scale: 1, 
        rotate: 0,
        y: [0, -10, 0],
      }}
      transition={{
        scale: { duration: 0.5 },
        rotate: { duration: 0.5 },
        y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
      }}
    >
      <motion.div
        className="relative"
        whileHover={{ scale: 1.2, rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl opacity-50"
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Emoji */}
        <div className="relative w-16 h-16 flex items-center justify-center text-5xl bg-white/10 backdrop-blur-md rounded-full border-2 border-white/20 shadow-2xl">
          <motion.span
            key={cognitiveState}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            {emoji}
          </motion.span>
        </div>

        {/* Particle effects */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 0,
              scale: 0 
            }}
            animate={{
              x: Math.cos((i * Math.PI * 2) / 6) * 40,
              y: Math.sin((i * Math.PI * 2) / 6) * 40,
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeOut',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
