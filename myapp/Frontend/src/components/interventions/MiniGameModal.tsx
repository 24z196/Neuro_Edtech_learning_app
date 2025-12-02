import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Gamepad2, Play, Trophy } from 'lucide-react';

interface MiniGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  addXP: (amount: number) => void;
}

type Shape = 'circle' | 'square' | 'triangle';
type Color = 'red' | 'blue' | 'green' | 'yellow';

interface Target {
  shape: Shape;
  color: Color;
}

interface GameItem {
  id: number;
  shape: Shape;
  color: Color;
  x: number;
  y: number;
}

export function MiniGameModal({ isOpen, onClose, addXP }: MiniGameModalProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'complete'>('ready');
  const [target, setTarget] = useState<Target>({ shape: 'circle', color: 'red' });
  const [items, setItems] = useState<GameItem[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const shapes: Shape[] = ['circle', 'square', 'triangle'];
  const colors: Color[] = ['red', 'blue', 'green', 'yellow'];

  const colorMap = {
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e',
    yellow: '#eab308',
  };

  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('complete');
            const earnedXP = score * 10;
            addXP(earnedXP);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, score]);

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        const newItem: GameItem = {
          id: Date.now(),
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          x: Math.random() * 80 + 10,
          y: -10,
        };
        setItems((prev) => [...prev, newItem]);
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setItems((prev) => {
          return prev
            .map((item) => ({ ...item, y: item.y + 2 }))
            .filter((item) => item.y < 110);
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [gameState]);

  const handleStart = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    setItems([]);
    setTarget({
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  };

  const handleItemClick = (item: GameItem) => {
    if (item.shape === target.shape && item.color === target.color) {
      setScore((prev) => prev + 1);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      // Set new target
      setTarget({
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  };

  const handleClose = () => {
    setGameState('ready');
    setScore(0);
    setTimeLeft(30);
    setItems([]);
    onClose();
  };

  const renderShape = (shape: Shape, color: Color, size: number = 40) => {
    const fill = colorMap[color];

    switch (shape) {
      case 'circle':
        return (
          <div
            className="rounded-full"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: fill,
            }}
          />
        );
      case 'square':
        return (
          <div
            className="rounded"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: fill,
            }}
          />
        );
      case 'triangle':
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${size / 2}px solid transparent`,
              borderRight: `${size / 2}px solid transparent`,
              borderBottom: `${size}px solid ${fill}`,
            }}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30 text-white max-w-3xl">
        <DialogTitle className="sr-only">Mini Game - Shape & Color Match</DialogTitle>
        <DialogDescription className="sr-only">
          Match shapes and colors in this fast-paced mini game
        </DialogDescription>
        <AnimatePresence mode="wait">
          {gameState === 'ready' ? (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-red-500 flex items-center justify-center mx-auto mb-6">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>

              <h2 className="mb-4 bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">
                Shape & Color Match
              </h2>

              <p className="text-gray-300 mb-6">
                Click on items that match both the target shape AND color. Be quick and accurate!
              </p>

              <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm text-purple-300 mb-2">How to Play</p>
                <ul className="text-sm text-gray-300 space-y-1 text-left max-w-xs mx-auto">
                  <li>• Click items matching the target</li>
                  <li>• Score points for correct matches</li>
                  <li>• You have 30 seconds</li>
                  <li>• Get the highest score possible!</li>
                </ul>
              </div>

              <Button
                onClick={handleStart}
                className="w-full bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white py-6"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            </motion.div>
          ) : gameState === 'complete' ? (
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
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 mb-6"
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="mb-4 bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">
                Game Over!
              </h2>

              <div className="mb-6">
                <div className="text-5xl mb-2">{score}</div>
                <p className="text-gray-400">Correct Matches</p>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30">
                <p className="text-sm text-gray-400 mb-1">XP Earned</p>
                <div className="text-2xl text-purple-400">+{score * 10} XP</div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleStart}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white py-6"
                >
                  Play Again
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 border-white/20 hover:bg-white/10 text-white py-6"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6"
            >
              {/* HUD */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Score</p>
                    <div className="text-2xl text-purple-400">{score}</div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Time</p>
                    <div className="text-2xl text-orange-400">{timeLeft}s</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-red-600/20 border border-purple-500/30">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Target</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center">
                        {renderShape(target.shape, target.color, 30)}
                      </div>
                      <span className="text-sm capitalize">{target.color} {target.shape}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Area */}
              <div className="relative h-96 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border border-white/10 overflow-hidden">
                {items.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="absolute cursor-pointer hover:scale-110 transition-transform"
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                    }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {renderShape(item.shape, item.color)}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}