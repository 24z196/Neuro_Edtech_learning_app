import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Wind, Play, CheckCircle } from 'lucide-react';

interface BreathingExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  addXP: (amount: number) => void;
}

type Phase = 'ready' | 'inhale' | 'hold' | 'exhale' | 'complete';

export function BreathingExerciseModal({ isOpen, onClose, addXP }: BreathingExerciseModalProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [cycle, setCycle] = useState(0);
  const [timer, setTimer] = useState(0);

  const totalCycles = 3;
  const phaseDurations = {
    inhale: 4,
    hold: 4,
    exhale: 4,
  };

  useEffect(() => {
    if (phase === 'ready' || phase === 'complete') return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        const duration = phaseDurations[phase as keyof typeof phaseDurations];
        if (prev >= duration) {
          // Move to next phase
          if (phase === 'inhale') {
            setPhase('hold');
            return 0;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 0;
          } else if (phase === 'exhale') {
            const nextCycle = cycle + 1;
            if (nextCycle >= totalCycles) {
              setPhase('complete');
              addXP(50);
              return 0;
            } else {
              setCycle(nextCycle);
              setPhase('inhale');
              return 0;
            }
          }
        }
        return prev + 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [phase, cycle]);

  const handleStart = () => {
    setPhase('inhale');
    setCycle(0);
    setTimer(0);
  };

  const handleClose = () => {
    setPhase('ready');
    setCycle(0);
    setTimer(0);
    onClose();
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      default:
        return '';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale':
        return 1 + (timer / phaseDurations.inhale) * 0.5;
      case 'hold':
        return 1.5;
      case 'exhale':
        return 1.5 - (timer / phaseDurations.exhale) * 0.5;
      default:
        return 1;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-orange-500/30 text-white max-w-2xl">
        <DialogTitle className="sr-only">Breathing Exercise</DialogTitle>
        <DialogDescription className="sr-only">
          Guided breathing exercise to re-energize yourself
        </DialogDescription>
        <AnimatePresence mode="wait">
          {phase === 'ready' ? (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6">
                <Wind className="w-8 h-8 text-white" />
              </div>

              <h2 className="mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Breathing Exercise
              </h2>

              <p className="text-gray-300 mb-6">
                This guided breathing exercise will help re-energize you. Follow the visual cues and complete {totalCycles} cycles.
              </p>

              <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <p className="text-sm text-orange-300">Instructions</p>
                <ul className="text-sm text-gray-300 mt-2 space-y-1 text-left">
                  <li>• Inhale for 4 seconds</li>
                  <li>• Hold for 4 seconds</li>
                  <li>• Exhale for 4 seconds</li>
                  <li>• Repeat 3 times</li>
                </ul>
              </div>

              <Button
                onClick={handleStart}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white py-6"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Exercise
              </Button>
            </motion.div>
          ) : phase === 'complete' ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-teal-500 mb-6"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Exercise Complete!
              </h2>

              <p className="text-gray-300 mb-6">
                Great job! You should feel more energized and focused now.
              </p>

              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30">
                <p className="text-sm text-gray-400 mb-1">XP Earned</p>
                <div className="text-2xl text-purple-400">+50 XP</div>
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white py-6"
              >
                Back to Learning
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="exercise"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6"
            >
              <div className="text-center mb-8">
                <p className="text-sm text-gray-400 mb-2">
                  Cycle {cycle + 1} of {totalCycles}
                </p>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden max-w-xs mx-auto">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((cycle + 1) / totalCycles) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-center mb-8" style={{ height: '300px' }}>
                <motion.div
                  animate={{ scale: getCircleScale() }}
                  transition={{ duration: 0.1 }}
                  className="w-48 h-48 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-2xl"
                  style={{
                    boxShadow: `0 0 60px ${phase === 'inhale' ? '#f97316' : phase === 'exhale' ? '#ef4444' : '#fb923c'}`,
                  }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{getPhaseText()}</div>
                    <div className="text-4xl">
                      {Math.ceil(phaseDurations[phase as keyof typeof phaseDurations] - timer)}
                    </div>
                  </div>
                </motion.div>
              </div>

              <p className="text-center text-gray-400 text-sm">
                Follow the circle as it expands and contracts
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}