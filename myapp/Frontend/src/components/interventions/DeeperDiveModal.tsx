import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { BookOpen, CheckCircle } from 'lucide-react';

interface DeeperDiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  addXP: (amount: number) => void;
}

const deeperContent = {
  title: 'Understanding Mitochondria: The Powerhouse of the Cell',
  sections: [
    {
      heading: 'What are Mitochondria?',
      content: 'Mitochondria are membrane-bound organelles found in most eukaryotic cells. They are often called the "powerhouse of the cell" because they generate most of the cell\'s supply of adenosine triphosphate (ATP), used as a source of chemical energy.',
    },
    {
      heading: 'Structure',
      content: 'Mitochondria have a double membrane structure: an outer membrane and an inner membrane with folds called cristae. This unique structure is essential for their function in energy production.',
    },
    {
      heading: 'Function',
      content: 'The primary function is cellular respiration, where nutrients are converted into ATP. This process occurs in three main stages: glycolysis, the Krebs cycle, and oxidative phosphorylation.',
    },
  ],
};

export function DeeperDiveModal({ isOpen, onClose, addXP }: DeeperDiveModalProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleNext = () => {
    if (currentSection < deeperContent.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setCompleted(true);
      addXP(100);
    }
  };

  const handleClose = () => {
    setCurrentSection(0);
    setCompleted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/30 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogTitle className="sr-only">Deeper Dive</DialogTitle>
        <DialogDescription className="sr-only">
          Explore this topic in comprehensive detail
        </DialogDescription>
        {!completed ? (
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  Deeper Dive
                </h2>
                <p className="text-sm text-gray-400">
                  Section {currentSection + 1} of {deeperContent.sections.length}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-6">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentSection + 1) / deeperContent.sections.length) * 100}%` }}
                />
              </div>

              <h3 className="text-white mb-4">{deeperContent.sections[currentSection].heading}</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                {deeperContent.sections[currentSection].content}
              </p>

              {/* Visual illustration placeholder */}
              <div className="p-8 rounded-xl bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/20 mb-6">
                <div className="text-center text-gray-400">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-green-400" />
                  <p>Interactive diagram would appear here</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white py-6"
            >
              {currentSection < deeperContent.sections.length - 1 ? 'Next Section' : 'Complete Deep Dive'}
            </Button>
          </motion.div>
        ) : (
          <motion.div
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

            <h2 className="mb-4 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
              Deep Dive Complete!
            </h2>

            <p className="text-gray-300 mb-6">
              Great job exploring this topic in depth. You've gained a comprehensive understanding!
            </p>

            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30">
              <p className="text-sm text-gray-400 mb-1">XP Earned</p>
              <div className="text-2xl text-purple-400">+100 XP</div>
            </div>

            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white py-6"
            >
              Back to Learning
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}