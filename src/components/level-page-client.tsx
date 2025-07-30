'use client';

import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FunctionGraph } from '@/components/function-graph';
import { FunctionInput } from '@/components/function-input';
import { LevelHeader } from '@/components/level-header';
import { MathKeyboard } from '@/components/math-keyboard';
import { useExerciseState } from '@/hooks/use-exercise-state';
import { useProgress } from '@/hooks/use-progress';
import type { Level } from '@/lib/levels';

interface LevelPageClientProps {
  level: Level;
}

export function LevelPageClient({ level }: LevelPageClientProps) {
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
  const { completeLevel } = useProgress([]);

  const router = useRouter();

  const {
    currentExercise,
    currentExerciseIndex,
    studentFunction,
    setStudentFunction,
    isCorrect,
    attempts,
    shouldShowExplanation,
    handleCheckAnswer,
    handleNextExercise,
    handleReset,
    handleShowHelp,
    isLastExercise,
    totalExercises,
  } = useExerciseState(level);

  const handleCompleteLevel = () => {
    completeLevel(level.id.toString());

    // Show confetti celebration
    const fireConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    };

    // Fire confetti multiple times with delays
    fireConfetti();
    setTimeout(fireConfetti, 250);
    setTimeout(fireConfetti, 500);

    // Side confetti bursts
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
    }, 100);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 300);

    // Navigate back to theme page after confetti
    setTimeout(() => {
      router.push(`/themes/${level.themeId}`);
    }, 1000); // Wait 1 second for confetti to play
  };

  // Math keyboard handlers
  const handleMathInput = (value: string) => {
    setStudentFunction((prev) => prev + value);
    setHasCheckedAnswer(false); // Reset when user types
  };

  const handleMathClear = () => {
    setStudentFunction('');
    setHasCheckedAnswer(false); // Reset when user clears input
  };

  const handleMathBackspace = () => {
    setStudentFunction((prev) => prev.slice(0, -1));
    setHasCheckedAnswer(false); // Reset when user modifies input
  };

  const handleMathEnter = () => {
    if (!studentFunction.trim()) {
      return;
    }

    if (hasCheckedAnswer && isCorrect) {
      if (isLastExercise) {
        handleCompleteLevel();
      } else {
        handleNextExercise();
        setHasCheckedAnswer(false);
      }
    } else {
      handleCheckAnswer();
      setHasCheckedAnswer(true);
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="container mx-auto w-full max-w-8xl px-4 py-8"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LevelHeader
        currentExerciseIndex={currentExerciseIndex}
        level={level}
        totalExercises={totalExercises}
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <FunctionGraph
          studentFunction={studentFunction}
          targetFunction={currentExercise.correctAnswer}
        />

        <FunctionInput
          attempts={attempts}
          exercise={currentExercise}
          isCorrect={isCorrect}
          isLastExercise={isLastExercise}
          onCheckAnswer={handleCheckAnswer}
          onCompleteLevel={handleCompleteLevel}
          onEnterPress={handleMathEnter}
          onNextExercise={handleNextExercise}
          onReset={handleReset}
          onShowHelp={handleShowHelp}
          setStudentFunction={setStudentFunction}
          shouldShowExplanation={shouldShowExplanation}
          studentFunction={studentFunction}
        />

        <motion.div
          animate={{ opacity: 1 }}
          className="lg:col-span-3"
          initial={{ opacity: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <MathKeyboard
            onBackspace={handleMathBackspace}
            onClear={handleMathClear}
            onEnter={handleMathEnter}
            onInput={handleMathInput}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
