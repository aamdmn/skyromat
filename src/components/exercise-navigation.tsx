import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

interface ExerciseNavigationProps {
  isCorrect: boolean | null;
  isLastExercise: boolean;
  onNextExercise: () => void;
  onCompleteLevel: () => void;
}

export function ExerciseNavigation({
  isCorrect,
  isLastExercise,
  onNextExercise,
  onCompleteLevel,
}: ExerciseNavigationProps) {
  if (!isCorrect) return null;

  if (isLastExercise) {
    return (
      <motion.div
        animate={{
          opacity: 1,
          scale: 1,
          transition: {
            delay: 0.8,
            type: 'spring',
            damping: 15,
            stiffness: 300,
          },
        }}
        initial={{ opacity: 0, scale: 0.8 }}
      >
        <Button
          className="h-12 w-full bg-gradient-to-r from-amber-500 to-orange-500 font-medium text-sm text-white shadow-lg transition-all duration-200 hover:from-amber-600 hover:to-orange-600 hover:shadow-xl"
          onClick={onCompleteLevel}
        >
          🎉 Dokončiť level
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          delay: 0.8,
          type: 'spring',
          damping: 20,
          stiffness: 300,
        },
      }}
      initial={{ opacity: 0, y: 10 }}
    >
      <Button
        className="h-12 w-full bg-emerald-600 font-medium text-sm shadow-lg transition-all duration-200 hover:bg-emerald-700 hover:shadow-xl"
        onClick={onNextExercise}
      >
        Ďalšie cvičenie →
      </Button>
    </motion.div>
  );
}
