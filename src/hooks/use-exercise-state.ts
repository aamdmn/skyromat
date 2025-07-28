import { compareFunctions } from '@/lib/math-utils';
import { useCallback, useState } from 'react';

interface Exercise {
  question: string;
  correctAnswer: string;
  explanation: string;
}

interface Level {
  exercises: Exercise[];
}

export function useExerciseState(level: Level) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [studentFunction, setStudentFunction] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentExercise = level.exercises[currentExerciseIndex];

  const handleCheckAnswer = useCallback(() => {
    if (!studentFunction.trim()) {
      return;
    }

    const correct = compareFunctions(
      currentExercise.correctAnswer,
      studentFunction
    );
    setIsCorrect(correct);
  }, [studentFunction, currentExercise.correctAnswer]);

  const handleNextExercise = useCallback(() => {
    if (currentExerciseIndex < level.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setStudentFunction('');
      setIsCorrect(null);
    }
  }, [currentExerciseIndex, level.exercises.length]);

  const handleReset = useCallback(() => {
    setStudentFunction('');
    setIsCorrect(null);
  }, []);

  const isLastExercise = currentExerciseIndex === level.exercises.length - 1;

  return {
    currentExercise,
    currentExerciseIndex,
    studentFunction,
    setStudentFunction,
    isCorrect,
    handleCheckAnswer,
    handleNextExercise,
    handleReset,
    isLastExercise,
    totalExercises: level.exercises.length,
  };
}
