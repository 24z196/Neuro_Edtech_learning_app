import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, Award } from 'lucide-react';

interface MiniQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  addXP: (amount: number) => void;
}

const quizQuestions = [
  {
    question: 'What is the primary function of mitochondria in a cell?',
    options: [
      'Protein synthesis',
      'Energy production',
      'DNA storage',
      'Cell division'
    ],
    correct: 1,
  },
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correct: 1,
  },
  {
    question: 'What is the speed of light in vacuum?',
    options: [
      '300,000 km/s',
      '150,000 km/s',
      '450,000 km/s',
      '200,000 km/s'
    ],
    correct: 0,
  },
];

export function MiniQuizModal({ isOpen, onClose, addXP }: MiniQuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === quizQuestions[currentQuestion].correct;
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizComplete(true);
        const earnedXP = (score + (isCorrect ? 1 : 0)) * 50;
        addXP(earnedXP);
      }
    }, 1500);
  };

  const handleClose = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-blue-500/30 text-white max-w-2xl">
        <DialogTitle className="sr-only">Mini Quiz</DialogTitle>
        <DialogDescription className="sr-only">
          Test your knowledge with this interactive quiz
        </DialogDescription>
        <AnimatePresence mode="wait">
          {!quizComplete ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                    Mini Quiz
                  </h2>
                  <div className="text-sm text-gray-400">
                    Question {currentQuestion + 1} of {quizQuestions.length}
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mb-8">
                <p className="text-lg mb-6">{quizQuestions[currentQuestion].question}</p>
                <div className="space-y-3">
                  {quizQuestions[currentQuestion].options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === quizQuestions[currentQuestion].correct;
                    const showFeedback = showResult && isSelected;

                    return (
                      <motion.button
                        key={index}
                        onClick={() => !showResult && handleAnswer(index)}
                        disabled={showResult}
                        whileHover={!showResult ? { scale: 1.02 } : {}}
                        whileTap={!showResult ? { scale: 0.98 } : {}}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          showFeedback
                            ? isCorrect
                              ? 'bg-green-500/20 border-green-500'
                              : 'bg-red-500/20 border-red-500'
                            : isSelected
                            ? 'bg-blue-500/20 border-blue-500'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showFeedback && (
                            isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400" />
                            )
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {!showResult && (
                <Button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white py-6"
                >
                  Submit Answer
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
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
                <Award className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                Quiz Complete!
              </h2>

              <div className="mb-6">
                <div className="text-4xl mb-2">
                  {score} / {quizQuestions.length}
                </div>
                <p className="text-gray-400">Correct Answers</p>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30">
                <p className="text-sm text-gray-400 mb-1">XP Earned</p>
                <div className="text-2xl text-purple-400">+{score * 50} XP</div>
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white py-6"
              >
                Continue Learning
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}