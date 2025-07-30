import { useCallback, useState } from 'react';
import { compareFunctions } from '@/lib/math-utils';

interface Exercise {
  question?: string;
  correctAnswer: string;
  explanation?: string;
}

interface Level {
  exercises: Exercise[];
}

export function useExerciseState(level: Level) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [studentFunction, setStudentFunction] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

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
    
    if (!correct) {
      setAttempts(prev => prev + 1);
    }
  }, [studentFunction, currentExercise.correctAnswer]);

  const handleNextExercise = useCallback(() => {
    if (currentExerciseIndex < level.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setStudentFunction('');
      setIsCorrect(null);
      setAttempts(0);
      setShowHelp(false);
    }
  }, [currentExerciseIndex, level.exercises.length]);

  const handleReset = useCallback(() => {
    setStudentFunction('');
    setIsCorrect(null);
  }, []);

  const handleShowHelp = useCallback(() => {
    setShowHelp(true);
  }, []);

  const isLastExercise = currentExerciseIndex === level.exercises.length - 1;
  const shouldShowExplanation = showHelp || attempts >= 5;

  return {
    currentExercise,
    currentExerciseIndex,
    studentFunction,
    setStudentFunction,
    isCorrect,
    attempts,
    showHelp,
    shouldShowExplanation,
    handleCheckAnswer,
    handleNextExercise,
    handleReset,
    handleShowHelp,
    isLastExercise,
    totalExercises: level.exercises.length,
  };
}
