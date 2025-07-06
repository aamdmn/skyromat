import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Theme } from '@/lib/levels';
import { cn } from '@/lib/utils';

interface ThemeCardProps {
  theme: Theme;
  className?: string;
}

export function ThemeCard({ theme, className }: ThemeCardProps) {
  return (
    <Link to="/themes/$themeId" params={{ themeId: theme.id }}>
      <Card
        className={cn(
          'flex h-full flex-col border-none shadow-none',
          className
        )}
      >
        <CardHeader>
          <CardTitle className="text-2xl">{theme.name}</CardTitle>
          <CardDescription>
            {theme.levels.length} levels to master
          </CardDescription>
        </CardHeader>
        <div className="flex-grow" />
        <CardFooter>
          <span className="flex items-center font-semibold text-primary">
            Start Learning <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
