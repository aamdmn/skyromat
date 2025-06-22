import { RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import type React from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getSuggestions, validateExpression } from '@/lib/math-utils';
import { ExerciseNavigation } from './exercise-navigation';
import { ExerciseResult } from './exercise-result';

interface Exercise {
  question: string;
  explanation: string;
}

interface FunctionInputProps {
  exercise: Exercise;
  studentFunction: string;
  setStudentFunction: (value: string) => void;
  isCorrect: boolean | null;
  onCheckAnswer: () => void;
  onReset: () => void;
  onNextExercise: () => void;
  onCompleteLevel: () => void;
  isLastExercise: boolean;
}

export function FunctionInput({
  exercise,
  studentFunction,
  setStudentFunction,
  isCorrect,
  onCheckAnswer,
  onReset,
  onNextExercise,
  onCompleteLevel,
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
      onCheckAnswer();
    }
  };

  const applySuggestion = (suggestion: string) => {
    setStudentFunction(suggestion);
  };

  return (
    <motion.div
      className="lg:col-span-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.3 }}
    >
      <Card className="h-full p-4">
        <h3 className="mb-3 font-semibold text-lg">Vaša funkcia</h3>

        <div className="mb-4">
          <p className="mb-3 text-sm">{exercise.question}</p>
          <div className="mb-3 text-muted-foreground text-xs">
            Napíšte funkciu, ktorá bude mať rovnaký graf ako modrá čiara.
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="function-input"
              className="mb-1 block font-medium text-sm"
            >
              f: y =
            </label>
            <Input
              id="function-input"
              type="text"
              placeholder="2*x + 3"
              value={studentFunction}
              onChange={(e) => setStudentFunction(e.target.value)}
              className={`h-10 font-mono text-base ${
                !isValid && studentFunction.trim()
                  ? 'border-red-500 focus:border-red-500'
                  : ''
              }`}
              onKeyDown={handleKeyDown}
            />

            {/* Validation feedback */}
            {!isValid && studentFunction.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2"
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
                      {suggestions.slice(0, 3).map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => applySuggestion(suggestion)}
                          className="rounded bg-blue-100 px-2 py-1 font-mono text-blue-800 text-xs transition-colors hover:bg-blue-200"
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
              onClick={onCheckAnswer}
              disabled={!studentFunction.trim() || !isValid}
              size="sm"
              className="h-7 text-xs"
            >
              Skontrolovať
            </Button>
            <Button
              variant="outline"
              onClick={onReset}
              size="sm"
              className="h-7 text-xs"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          </div>

          <ExerciseResult
            isCorrect={isCorrect}
            explanation={exercise.explanation}
          />

          <ExerciseNavigation
            isCorrect={isCorrect}
            isLastExercise={isLastExercise}
            onNextExercise={onNextExercise}
            onCompleteLevel={onCompleteLevel}
          />
        </div>
      </Card>
    </motion.div>
  );
}
