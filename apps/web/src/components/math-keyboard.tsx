import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MathKeyboardProps {
  onInput: (value: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onEnter: () => void;
}

export function MathKeyboard({
  onInput,
  onClear,
  onBackspace,
  onEnter,
}: MathKeyboardProps) {
  const symbols = [
    { label: 'x', value: 'x', className: 'font-mono' },
    { label: '+', value: ' + ', className: 'text-sm font-bold' },
    { label: '-', value: ' - ', className: 'text-sm font-bold' },
    { label: '×', value: ' * ', className: 'text-sm font-bold' },
    { label: '÷', value: ' / ', className: 'text-sm font-bold' },
    { label: '^', value: '^', className: 'text-sm font-bold' },
    { label: '(', value: '(', className: 'font-mono' },
    { label: ')', value: ')', className: 'font-mono' },
    { label: '.', value: '.', className: 'font-mono' },
    { label: '=', value: ' = ', className: 'text-sm font-bold' },
  ];

  const functions = [
    { label: 'sin', value: 'sin(', className: 'font-mono text-xs' },
    { label: 'cos', value: 'cos(', className: 'font-mono text-xs' },
    { label: 'tan', value: 'tan(', className: 'font-mono text-xs' },
    { label: '√', value: 'sqrt(', className: 'font-mono text-xs' },
    { label: 'log', value: 'log(', className: 'font-mono text-xs' },
    { label: 'ln', value: 'ln(', className: 'font-mono text-xs' },
    { label: 'abs', value: 'abs(', className: 'font-mono text-xs' },
  ];

  const numbers = [
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '0', value: '0' },
    { label: '-', value: '-' },
    { label: '.', value: '.' },
  ];

  const examples = [
    { label: '2x + 1', value: '2*x + 1' },
    { label: '3x - 2', value: '3*x - 2' },
    { label: 'x²', value: 'x^2' },
    { label: 'sin(x)', value: 'sin(x)' },
  ];

  return (
    <Card className="space-y-2 p-3">
      <div className="mb-1 font-medium text-muted-foreground text-xs">
        Math Keyboard
      </div>

      {/* Functions Row */}
      <div className="grid grid-cols-7 gap-1">
        {functions.map((func) => (
          <Button
            key={func.label}
            variant="outline"
            size="sm"
            onClick={() => onInput(func.value)}
            className={`h-6 text-xs ${func.className}`}
          >
            {func.label}
          </Button>
        ))}
      </div>

      {/* Symbols Row */}
      <div className="grid grid-cols-5 gap-1">
        {symbols.map((symbol) => (
          <Button
            key={symbol.label}
            variant="outline"
            size="sm"
            onClick={() => onInput(symbol.value)}
            className={`h-6 ${symbol.className}`}
          >
            {symbol.label}
          </Button>
        ))}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-1">
        {numbers.map((num) => (
          <Button
            key={num.label}
            variant="outline"
            size="sm"
            onClick={() => onInput(num.value)}
            className="h-6 font-mono text-xs"
          >
            {num.label}
          </Button>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-3 gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="h-6 text-xs"
        >
          Clear
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onBackspace}
          className="h-6 text-xs"
        >
          ← Back
        </Button>
        <Button onClick={onEnter} size="sm" className="h-6 text-xs">
          Check ✓
        </Button>
      </div>

      {/* Common Examples */}
      <div className="space-y-1">
        <div className="text-muted-foreground text-xs">Quick Examples:</div>
        <div className="grid grid-cols-4 gap-1">
          {examples.map((example) => (
            <Button
              key={example.label}
              variant="ghost"
              size="sm"
              onClick={() => onInput(example.value)}
              className="h-5 justify-start font-mono text-xs hover:bg-muted"
            >
              {example.label}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
