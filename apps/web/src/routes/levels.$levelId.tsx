import { Link, createFileRoute } from '@tanstack/react-router';
import { CheckCircle, RotateCcw, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { MathKeyboard } from '@/components/math-keyboard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
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

// Function to parse and evaluate mathematical expressions
function evaluateFunction(func: string, x: number): number | null {
  try {
    // Replace common mathematical functions and variables
    const sanitizedFunc = func
      .replace(/x/g, `(${x})`)
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/log/g, 'Math.log')
      .replace(/ln/g, 'Math.log')
      .replace(/abs/g, 'Math.abs');

    // Create a safe evaluation context with only mathematical functions
    const safeEval = (expression: string): number => {
      // Only allow safe mathematical operations
      const allowedChars = /^[0-9+\-*/().,Math\s]+$/;
      if (!allowedChars.test(expression)) {
        throw new Error('Invalid characters in expression');
      }

      // Use Function constructor instead of eval for better security
      const result = new Function('Math', `return ${expression}`)(Math);
      return result;
    };

    const result = safeEval(sanitizedFunc);
    return typeof result === 'number' && Number.isFinite(result)
      ? result
      : null;
  } catch {
    return null;
  }
}

// Function to generate points for plotting
function generateFunctionPoints(
  func: string,
  xRange: [number, number],
  numPoints = 100
) {
  const points: { x: number; y: number }[] = [];
  const [minX, maxX] = xRange;
  const step = (maxX - minX) / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const x = minX + i * step;
    const y = evaluateFunction(func, x);
    if (y !== null) {
      points.push({ x, y });
    }
  }

  return points;
}

// Smart comparison function that samples multiple points
function compareFunctions(
  targetFunc: string,
  studentFunc: string,
  tolerance = 0.1
): boolean {
  const xRange: [number, number] = [-10, 10];
  const numSamples = 150; // Sample 150+ points for robust comparison

  const targetPoints = generateFunctionPoints(targetFunc, xRange, numSamples);
  const studentPoints = generateFunctionPoints(studentFunc, xRange, numSamples);

  if (targetPoints.length === 0 || studentPoints.length === 0) {
    return false;
  }

  // Compare points at the same x-coordinates
  let matchingPoints = 0;
  let totalComparisons = 0;

  for (const targetPoint of targetPoints) {
    const studentPoint = studentPoints.find(
      (p) => Math.abs(p.x - targetPoint.x) < 0.01
    );
    if (studentPoint) {
      totalComparisons++;
      if (Math.abs(targetPoint.y - studentPoint.y) <= tolerance) {
        matchingPoints++;
      }
    }
  }

  // Require at least 90% of points to match within tolerance
  return totalComparisons > 0 && matchingPoints / totalComparisons >= 0.9;
}

function LevelComponent() {
  const { level } = Route.useLoaderData();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [studentFunction, setStudentFunction] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentExercise = level.exercises[currentExerciseIndex];

  // Parse the target function from the exercise
  const targetFunction = useMemo(() => {
    // Extract function from question or use a default
    const question = currentExercise.question;
    const match = question.match(/y\s*=\s*([^?]+)/i);
    return match ? match[1].trim() : '2*x + 1'; // Default fallback
  }, [currentExercise]);

  // Generate chart data
  const chartData = useMemo(() => {
    const xRange: [number, number] = [-10, 10];
    const targetPoints = generateFunctionPoints(targetFunction, xRange);
    const studentPoints = studentFunction
      ? generateFunctionPoints(studentFunction, xRange)
      : [];

    // Create a combined dataset for Recharts
    const combinedData = targetPoints.map((point, index) => {
      const studentPoint = studentPoints[index];
      return {
        x: point.x,
        target: point.y,
        student: studentPoint ? studentPoint.y : null,
      };
    });

    return combinedData;
  }, [targetFunction, studentFunction]);

  const handleCheckAnswer = useCallback(() => {
    if (!studentFunction.trim()) {
      return;
    }

    const correct = compareFunctions(targetFunction, studentFunction);
    setIsCorrect(correct);
    setShowExplanation(true);
  }, [studentFunction, targetFunction]);

  const handleNextExercise = () => {
    if (currentExerciseIndex < level.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setStudentFunction('');
      setIsCorrect(null);
      setShowExplanation(false);
    }
  };

  const handleReset = () => {
    setStudentFunction('');
    setIsCorrect(null);
    setShowExplanation(false);
  };

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

  const chartConfig = {
    target: {
      label: 'Cieľová funkcia',
      color: '#3b82f6',
    },
    student: {
      label: 'Vaša funkcia',
      color: '#ef4444',
    },
  };

  return (
    <motion.div
      className="container mx-auto w-full max-w-8xl px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Link
          to="/"
          className="text-muted-foreground transition-colors hover:text-primary"
        >
          ← Späť na úrovne
        </Link>
      </motion.div>

      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <h1 className="mb-2 font-semibold text-3xl">{level.name}</h1>
        <p className="text-lg text-muted-foreground">{level.description}</p>
        <div className="mt-2 text-muted-foreground text-sm">
          Cvičenie {currentExerciseIndex + 1} z {level.exercises.length}
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Graph Section */}
        <motion.div
          className="lg:col-span-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Graf funkcie</CardTitle>
              <CardDescription>
                Porovnajte vašu funkciu s cieľovou
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <LineChart
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                    top: 12,
                    bottom: 12,
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={[-10, 10]}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
                    tickCount={11}
                  />
                  <YAxis
                    type="number"
                    domain={[-10, 10]}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
                    tickCount={11}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />

                  {/* Target Function Line */}
                  <Line
                    type="linear"
                    dataKey="target"
                    stroke="var(--color-target)"
                    strokeWidth={2}
                    dot={false}
                  />

                  {/* Student Function Line */}
                  {studentFunction && (
                    <Line
                      type="linear"
                      dataKey="student"
                      stroke="var(--color-student)"
                      strokeWidth={2}
                      strokeDasharray="8 4"
                      dot={false}
                    />
                  )}
                </LineChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-4 leading-none">
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-3 rounded bg-blue-500" />
                  <span className="text-muted-foreground">Cieľová funkcia</span>
                </div>
                {studentFunction && (
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-3 rounded border-red-500 border-dashed bg-red-500" />
                    <span className="text-muted-foreground">Vaša funkcia</span>
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Input Section */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Card className="h-full p-4">
            <h3 className="mb-3 font-semibold text-lg">Vaša funkcia</h3>

            <div className="mb-4">
              <p className="mb-3 text-sm">{currentExercise.question}</p>
              <div className="mb-3 rounded-lg bg-muted p-2">
                <span className="font-mono text-xs">
                  Cieľ: y = {targetFunction}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="function-input"
                  className="mb-1 block font-medium text-xs"
                >
                  Zadajte vašu funkciu:
                </label>
                <Input
                  id="function-input"
                  type="text"
                  placeholder="napr., 2*x + 1"
                  value={studentFunction}
                  onChange={(e) => setStudentFunction(e.target.value)}
                  className="h-8 font-mono text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCheckAnswer();
                    }
                  }}
                />
              </div>

              <div className="flex gap-1">
                <Button
                  onClick={handleCheckAnswer}
                  disabled={!studentFunction.trim()}
                  size="sm"
                  className="h-7 text-xs"
                >
                  Skontrolovať
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  size="sm"
                  className="h-7 text-xs"
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Reset
                </Button>
              </div>

              {/* Result Display */}
              {isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`rounded-lg border p-3 text-xs ${
                    isCorrect
                      ? 'border-green-200 bg-green-50 text-green-800'
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">
                      {isCorrect ? 'Správne!' : 'Skúste znova'}
                    </span>
                  </div>
                  {showExplanation && (
                    <p className="mt-1 text-xs">
                      {currentExercise.explanation}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Navigation */}
              {isCorrect &&
                currentExerciseIndex < level.exercises.length - 1 && (
                  <Button
                    onClick={handleNextExercise}
                    className="h-7 w-full text-xs"
                  >
                    Ďalšie cvičenie
                  </Button>
                )}
            </div>
          </Card>
        </motion.div>

        {/* Math Keyboard */}
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
