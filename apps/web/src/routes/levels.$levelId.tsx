import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'motion/react';

import { FunctionGraph } from '@/components/function-graph';
import { FunctionInput } from '@/components/function-input';
import { LevelHeader } from '@/components/level-header';
import { MathKeyboard } from '@/components/math-keyboard';
import { useExerciseState } from '@/hooks/use-exercise-state';
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
  const { level } = Route.useLoaderData();

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

  // Math keyboard handlers
  const handleMathInput = (value: string) => {
    setStudentFunction((prev) => prev + value);
  };

  const handleMathClear = () => {
    setStudentFunction('');
  };

  const handleMathBackspace = () => {
    setStudentFunction((prev) => prev.slice(0, -1));
  };

  const handleMathEnter = () => {
    handleCheckAnswer();
  };

  const handleCompleteLevel = () => {
    alert(
      '🎉 Gratulujeme! Úspešne ste dokončili level!\n\nVrátime vás na zoznam levelov.'
    );
    window.location.href = '/';
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
