import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Lightbulb, Sparkles } from 'lucide-react';

interface AnalogyCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  addXP: (amount: number) => void;
}

export function AnalogyCreatorModal({ isOpen, onClose, addXP }: AnalogyCreatorModalProps) {
  const [analogy, setAnalogy] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const concept = 'Photosynthesis';
  const prompt = 'Create an analogy to explain photosynthesis in everyday terms';

  const handleSubmit = () => {
    if (analogy.trim()) {
      setSubmitted(true);
      setFeedback('Excellent analogy! You\'ve made a creative connection that helps solidify your understanding of photosynthesis. Comparing it to a solar-powered factory is brilliant!');
      addXP(75);
    }
  };

  const handleClose = () => {
    setAnalogy('');
    setSubmitted(false);
    setFeedback('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-500/30 text-white max-w-2xl">
        <DialogTitle className="sr-only">Analogy Creator</DialogTitle>
        <DialogDescription className="sr-only">
          Create meaningful analogies to deepen your understanding
        </DialogDescription>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                Analogy Creator
              </h2>
              <p className="text-sm text-gray-400">Make meaningful connections</p>
            </div>
          </div>

          {!submitted ? (
            <>
              <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-300 mb-1">Concept</p>
                <p className="text-white">{concept}</p>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 mb-4">{prompt}</p>
                <div className="relative">
                  <textarea
                    value={analogy}
                    onChange={(e) => setAnalogy(e.target.value)}
                    placeholder="Type your analogy here... (e.g., Photosynthesis is like a solar-powered factory where...)"
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                    {analogy.length} characters
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-300 mb-2">💡 Tip</p>
                <p className="text-sm text-gray-300">
                  Think of something familiar from everyday life that works in a similar way to {concept.toLowerCase()}.
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={analogy.trim().length < 20}
                className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Analogy
              </Button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="mb-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                  <p className="text-sm text-gray-400 mb-2">Your Analogy</p>
                  <p className="text-white italic">"{analogy}"</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/30">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-green-300 mb-1">AI Feedback</p>
                      <p className="text-white text-sm">{feedback}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-center">
                <p className="text-sm text-gray-400 mb-1">XP Earned</p>
                <div className="text-2xl text-purple-400">+75 XP</div>
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white py-6"
              >
                Continue Learning
              </Button>
            </motion.div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}