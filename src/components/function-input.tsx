import { Lightbulb, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import type React from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Exercise } from '@/lib/levels';
import { getSuggestions, validateExpression } from '@/lib/math-utils';
import { ExerciseNavigation } from './exercise-navigation';
import { ExerciseResult } from './exercise-result';

interface FunctionInputProps {
  exercise: Exercise;
  studentFunction: string;
  setStudentFunction: (value: string) => void;
  isCorrect: boolean | null;
  attempts: number;
  shouldShowExplanation: boolean;
  onCheckAnswer: () => void;
  onReset: () => void;
  onShowHelp: () => void;
  onNextExercise: () => void;
  onCompleteLevel: () => void;
  onEnterPress: () => void;
  isLastExercise: boolean;
}

export function FunctionInput({
  exercise,
  studentFunction,
  setStudentFunction,
  isCorrect,
  attempts,
  shouldShowExplanation,
  onCheckAnswer,
  onReset,
  onShowHelp,
  onNextExercise,
  onCompleteLevel,
  onEnterPress,
  isLastExercise,
}: FunctionInputProps) {
  const [isValid, setIsValid] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Validate expression as user types
  useEffect(() => {
    if (!studentFunction.trim()) {
      setIsValid(true);
      setSuggestions([]);
      return;
    }

    const valid = validateExpression(studentFunction);
    setIsValid(valid);

    if (valid) {
      setSuggestions([]);
    } else {
      const suggestionList = getSuggestions(studentFunction);
      setSuggestions(suggestionList);
    }
  }, [studentFunction]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && studentFunction.trim()) {
      onEnterPress();
    }
  };

  const applySuggestion = (suggestion: string) => {
    setStudentFunction(suggestion);
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="lg:col-span-3"
      initial={{ opacity: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
    >
      <Card className="h-full p-4">
        <h3 className="mb-3 font-semibold text-lg">Vaša funkcia</h3>

        <div className="mb-4">
          {exercise.question && (
            <p className="mb-3 text-sm">{exercise.question}</p>
          )}
          <div className="mb-3 text-muted-foreground text-xs">
            Napíšte funkciu, ktorá bude mať rovnaký graf ako modrá čiara.
          </div>
          {attempts > 0 && (
            <div className="mb-2 text-muted-foreground text-xs">
              Pokusov: {attempts}
              {attempts >= 5 && exercise.explanation && (
                <span className="ml-2 text-amber-600">
                  (Vysvetlenie je dostupné)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label
              className="mb-1 block font-medium text-sm"
              htmlFor="function-input"
            >
              f: y =
            </label>
            <Input
              autoFocus
              className={`h-10 font-mono text-base ${
                !isValid && studentFunction.trim()
                  ? 'border-red-500 focus:border-red-500'
                  : ''
              }`}
              id="function-input"
              onChange={(e) => setStudentFunction(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="x + 3"
              type="text"
              value={studentFunction}
            />

            {/* Validation feedback */}
            {!isValid && studentFunction.trim() && (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mt-2"
                initial={{ opacity: 0, y: -10 }}
              >
                <p className="text-red-600 text-xs">
                  Neplatný matematický výraz
                </p>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="mb-1 text-muted-foreground text-xs">
                      Možno ste mysleli:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {suggestions.slice(0, 3).map((suggestion) => (
                        <button
                          className="rounded bg-blue-100 px-2 py-1 font-mono text-blue-800 text-xs transition-colors hover:bg-blue-200"
                          key={suggestion}
                          onClick={() => applySuggestion(suggestion)}
                          type="button"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <div className="flex gap-1">
            <Button
              className="h-7 text-xs"
              disabled={!(studentFunction.trim() && isValid)}
              onClick={onCheckAnswer}
              size="sm"
            >
              Skontrolovať
            </Button>
            <Button
              className="h-7 text-xs"
              onClick={onReset}
              size="sm"
              variant="outline"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
            <Button
              className="h-7 text-xs"
              disabled={!exercise.explanation}
              onClick={onShowHelp}
              size="sm"
              title={
                exercise.explanation
                  ? 'Zobraziť nápovedu'
                  : 'Nápoveda nie je dostupná'
              }
              variant="outline"
            >
              <Lightbulb className="mr-1 h-3 w-3" />
              Nápoveda
            </Button>
          </div>

          <ExerciseResult
            explanation={exercise.explanation || ''}
            isCorrect={isCorrect}
            shouldShowExplanation={shouldShowExplanation}
          />

          <ExerciseNavigation
            isCorrect={isCorrect}
            isLastExercise={isLastExercise}
            onCompleteLevel={onCompleteLevel}
            onNextExercise={onNextExercise}
          />
        </div>
      </Card>
    </motion.div>
  );
}
