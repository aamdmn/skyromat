import { motion } from 'motion/react';
import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { generateFunctionPoints } from '@/lib/math-utils';

interface FunctionGraphProps {
  targetFunction: string;
  studentFunction: string;
}

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

export function FunctionGraph({
  targetFunction,
  studentFunction,
}: FunctionGraphProps) {
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

  return (
    <motion.div
      className="lg:col-span-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.3 }}
    >
      <Card className="h-full bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Graf funkcie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="select-none">
            <ChartContainer config={chartConfig}>
              <LineChart
                data={chartData}
                margin={{
                  left: 20,
                  right: 20,
                  top: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="1 1" stroke="#d1d5db" />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[-10, 10]}
                  tickLine={true}
                  axisLine={true}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: '#374151' }}
                  tickCount={21}
                  stroke="#6b7280"
                />
                <YAxis
                  type="number"
                  domain={[-10, 10]}
                  tickLine={true}
                  axisLine={true}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: '#374151' }}
                  tickCount={21}
                  stroke="#6b7280"
                />
                <ChartTooltip
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  content={<ChartTooltipContent hideLabel />}
                />

                {/* Target Function Line - prominent blue */}
                <Line
                  type="linear"
                  dataKey="target"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />

                {/* Student Function Line - helper, less prominent */}
                {studentFunction && (
                  <Line
                    type="linear"
                    dataKey="student"
                    stroke="#dc2626"
                    strokeWidth={2}
                    strokeOpacity={0.8}
                    strokeDasharray="4 2"
                    dot={false}
                    connectNulls={false}
                  />
                )}
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-4 leading-none">
            <div className="flex items-center gap-2">
              <div className="h-1 w-4 rounded bg-blue-600" />
              <span className="font-medium text-muted-foreground">
                Cieľová funkcia
              </span>
            </div>
            {studentFunction && (
              <div className="flex items-center gap-2">
                <div className="h-1 w-4 rounded bg-pink-500 opacity-70" />
                <span className="text-muted-foreground">
                  g: y = {studentFunction}
                </span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
