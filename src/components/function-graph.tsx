import { motion } from 'motion/react';
import type React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '@/components/ui/button';
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
  const [xRange, setXRange] = useState<[number, number]>([-10, 10]);
  const [yRange, setYRange] = useState<[number, number]>([-10, 10]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate chart data
  const chartData = useMemo(() => {
    const targetPoints = generateFunctionPoints(targetFunction, xRange, 100);
    const studentPoints = studentFunction
      ? generateFunctionPoints(studentFunction, xRange, 100)
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
  }, [targetFunction, studentFunction, xRange]);

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;

    setXRange((prev) => {
      const center = (prev[0] + prev[1]) / 2;
      const width = (prev[1] - prev[0]) * zoomFactor;
      return [center - width / 2, center + width / 2];
    });

    setYRange((prev) => {
      const center = (prev[0] + prev[1]) / 2;
      const height = (prev[1] - prev[0]) * zoomFactor;
      return [center - height / 2, center + height / 2];
    });
  }, []);

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  // Handle mouse move for panning
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!(isDragging && dragStart && containerRef.current)) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = (e.clientX - dragStart.x) / rect.width;
      const deltaY = (e.clientY - dragStart.y) / rect.height;

      const xWidth = xRange[1] - xRange[0];
      const yHeight = yRange[1] - yRange[0];

      setXRange((prev) => [
        prev[0] - deltaX * xWidth,
        prev[1] - deltaX * xWidth,
      ]);

      setYRange((prev) => [
        prev[0] + deltaY * yHeight,
        prev[1] + deltaY * yHeight,
      ]);

      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart, xRange, yRange]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Reset zoom
  const handleReset = useCallback(() => {
    setXRange([-10, 10]);
    setYRange([-10, 10]);
  }, []);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="lg:col-span-6"
      initial={{ opacity: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
    >
      <Card className="h-full bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Graf funkcie</CardTitle>
          <Button
            className="h-8 px-3"
            onClick={handleReset}
            size="sm"
            variant="outline"
          >
            Reset
          </Button>
        </CardHeader>
        <CardContent>
          <div
            className="select-none"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            ref={containerRef}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer height={400} width="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    left: 20,
                    right: 20,
                    top: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="1 1" />

                  <XAxis
                    axisLine={true}
                    dataKey="x"
                    domain={xRange}
                    stroke="#6b7280"
                    tick={{ fontSize: 12, fill: '#374151' }}
                    tickFormatter={(value) => value.toFixed(1)}
                    tickLine={true}
                    tickMargin={8}
                    type="number"
                  />

                  <YAxis
                    axisLine={true}
                    domain={yRange}
                    stroke="#6b7280"
                    tick={{ fontSize: 12, fill: '#374151' }}
                    tickFormatter={(value) => value.toFixed(1)}
                    tickLine={true}
                    tickMargin={8}
                    type="number"
                  />

                  {/* Reference lines for axes through origin */}
                  <ReferenceLine
                    stroke="#9ca3af"
                    strokeDasharray="2 2"
                    strokeOpacity={0.6}
                    strokeWidth={1}
                    x={0}
                  />
                  <ReferenceLine
                    stroke="#9ca3af"
                    strokeDasharray="2 2"
                    strokeOpacity={0.6}
                    strokeWidth={1}
                    y={0}
                  />

                  <ChartTooltip
                    content={<ChartTooltipContent hideLabel />}
                    cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  />

                  {/* Target Function Line - prominent blue */}
                  <Line
                    animationDuration={600}
                    animationEasing="ease-out"
                    connectNulls={false}
                    dataKey="target"
                    dot={false}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    type="monotone"
                  />

                  {/* Student Function Line - helper, less prominent */}
                  {studentFunction && (
                    <Line
                      animationDuration={650}
                      animationEasing="ease-in-out"
                      connectNulls={false}
                      dataKey="student"
                      dot={false}
                      stroke="#dc2626"
                      strokeDasharray="4 2"
                      strokeOpacity={0.8}
                      strokeWidth={2}
                      type="monotone"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
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
                <div className="h-1 w-4 rounded bg-red-600 opacity-80" />
                <span className="text-muted-foreground">
                  f: x = {studentFunction}
                </span>
              </div>
            )}
          </div>
          <div className="text-muted-foreground text-xs">
            💡 Tip: Koliesko myši na zoom, ťahajte pre posúvanie
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
