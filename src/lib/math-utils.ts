import { all, create } from 'mathjs/number';

// Create a lightweight math.js instance with just number support
const math = create(all);

/**
 * Evaluates a mathematical function at a given x value
 * Uses math.js for safe and robust expression evaluation
 */
export function evaluateFunction(func: string, x: number): number | null {
  if (!func || typeof func !== 'string') {
    return null;
  }

  try {
    // Handle constants (numbers without x)
    const constantMatch = func.match(/^\s*([+-]?\d*\.?\d+)\s*$/);
    if (constantMatch) {
      const value = Number.parseFloat(constantMatch[1]);
      return Number.isFinite(value) ? value : null;
    }

    // Check if function contains 'x' variable
    if (!func.includes('x')) {
      // Try to evaluate as constant
      const result = math.evaluate(func);
      return typeof result === 'number' && Number.isFinite(result)
        ? result
        : null;
    }

    // Evaluate function with x substituted
    const result = math.evaluate(func, { x });
    return typeof result === 'number' && Number.isFinite(result)
      ? result
      : null;
  } catch (error) {
    // Return null for any evaluation errors
    console.warn('Function evaluation error:', error);
    return null;
  }
}

/**
 * Generates points for plotting a mathematical function
 */
export function generateFunctionPoints(
  func: string,
  xRange: [number, number],
  numPoints = 100
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const [minX, maxX] = xRange;

  if (minX >= maxX || numPoints <= 0) {
    return points;
  }

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

/**
 * Compares two mathematical functions for equivalence using sampling
 * Uses math.js for more robust function evaluation
 */
export function compareFunctions(
  targetFunc: string,
  studentFunc: string,
  tolerance = 0.0001
): boolean {
  if (!(targetFunc && studentFunc)) {
    return false;
  }

  // Trim whitespace
  const target = targetFunc.trim();
  const student = studentFunc.trim();

  // Check for exact string match (after normalization)
  if (normalizeExpression(target) === normalizeExpression(student)) {
    return true;
  }

  // Sample-based comparison for functional equivalence
  const numSamples = 1000;
  const xRange: [number, number] = [-100, 100];
  let matchingPoints = 0;
  let validComparisons = 0;

  for (let i = 0; i < numSamples; i++) {
    // Generate random x value in the range
    const x = Math.random() * (xRange[1] - xRange[0]) + xRange[0];

    // Evaluate both functions at this x
    const targetY = evaluateFunction(target, x);
    const studentY = evaluateFunction(student, x);

    // Skip if either function is undefined at this point
    if (targetY === null || studentY === null) {
      continue;
    }

    validComparisons++;

    // Check if Y values match within tolerance
    if (Math.abs(targetY - studentY) < tolerance) {
      matchingPoints++;
    }
  }

  // Require at least 95% of valid points to match within tolerance
  // and need at least 500 valid comparisons for reliability
  return validComparisons >= 500 && matchingPoints / validComparisons >= 0.95;
}

/**
 * Normalizes mathematical expressions for comparison
 * Removes whitespace and standardizes common patterns
 */
function normalizeExpression(expr: string): string {
  return expr
    .replace(/\s+/g, '') // Remove all whitespace
    .replace(/\*\*/g, '^') // Convert ** to ^
    .replace(/\b(\d+)\s*\*\s*x/g, '$1*x') // Normalize coefficient notation
    .replace(/\bx\s*\*\s*(\d+)/g, '$1*x') // Normalize coefficient notation
    .toLowerCase();
}

/**
 * Validates if a mathematical expression is syntactically correct
 */
export function validateExpression(expr: string): boolean {
  if (!expr || typeof expr !== 'string') {
    return false;
  }

  try {
    // Try to parse the expression
    math.parse(expr);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets suggested corrections for common mathematical notation errors
 */
export function getSuggestions(expr: string): string[] {
  const suggestions: string[] = [];

  if (!expr) {
    return suggestions;
  }

  // Common corrections
  const corrections: { [key: string]: string } = {
    '2x': '2*x',
    '3x': '3*x',
    '4x': '4*x',
    '5x': '5*x',
    x2: 'x^2',
    x3: 'x^3',
    'x²': 'x^2',
    'x³': 'x^3',
    '√': 'sqrt',
    '∛': 'cbrt',
  };

  for (const [wrong, correct] of Object.entries(corrections)) {
    if (expr.includes(wrong)) {
      suggestions.push(expr.replace(wrong, correct));
    }
  }

  return suggestions;
}
