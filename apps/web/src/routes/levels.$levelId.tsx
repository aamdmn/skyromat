import { createFileRoute, useRouter } from '@tanstack/react-router';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { useState } from 'react';

import { FunctionGraph } from '@/components/function-graph';
import { FunctionInput } from '@/components/function-input';
import { LevelHeader } from '@/components/level-header';
import { MathKeyboard } from '@/components/math-keyboard';
import { useExerciseState } from '@/hooks/use-exercise-state';
import { useProgress } from '@/hooks/use-progress';
import { getLevelById } from '../lib/levels';

export const Route = createFileRoute('/levels/$levelId')({
  component: LevelComponent,
  loader: ({ params }: { params: { levelId: string } }) => {
    const level = getLevelById(params.levelId);
    if (!level) {
      throw new Error('Level not found');
    }
    return { level };
  },
});

function LevelComponent() {
  const router = useRouter();
  const { level } = Route.useLoaderData();
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
  const { completeLevel } = useProgress([]);

  const {
    currentExercise,
    currentExerciseIndex,
    studentFunction,
    setStudentFunction,
    isCorrect,
    handleCheckAnswer,
    handleNextExercise,
    handleReset,
    isLastExercise,
    totalExercises,
  } = useExerciseState(level);

  const handleCompleteLevel = () => {
    completeLevel(level.id);

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
      router.navigate({
        to: '/themes/$themeId',
        params: { themeId: level.themeId },
      });
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
      className="container mx-auto w-full max-w-8xl px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LevelHeader
        level={level}
        currentExerciseIndex={currentExerciseIndex}
        totalExercises={totalExercises}
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <FunctionGraph
          targetFunction={currentExercise.correctAnswer}
          studentFunction={studentFunction}
        />

        <FunctionInput
          exercise={currentExercise}
          studentFunction={studentFunction}
          setStudentFunction={setStudentFunction}
          isCorrect={isCorrect}
          onCheckAnswer={handleCheckAnswer}
          onReset={handleReset}
          onNextExercise={handleNextExercise}
          onCompleteLevel={handleCompleteLevel}
          onEnterPress={handleMathEnter}
          isLastExercise={isLastExercise}
        />

        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <MathKeyboard
            onInput={handleMathInput}
            onClear={handleMathClear}
            onBackspace={handleMathBackspace}
            onEnter={handleMathEnter}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
