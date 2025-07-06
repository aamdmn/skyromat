import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

import type { Theme } from '@/lib/levels';
import { cn } from '@/lib/utils';

interface ThemeCardProps {
  theme: Theme;
  className?: string;
  index?: number;
}

export function ThemeCard({ theme, className, index = 0 }: ThemeCardProps) {
  return (
    <motion.div
      className={cn('w-full', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to="/themes/$themeId"
        params={{ themeId: theme.id }}
        className="block"
      >
        <motion.div
          className="relative h-64 w-full items-center justify-center overflow-hidden rounded-[3rem] md:h-80"
          initial={false}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="absolute inset-0 rounded-[3rem] bg-card" />
          <motion.div
            className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[3rem] bg-[#dedede]"
            whileHover={{ opacity: 0.8 }}
            initial={{ opacity: 0.6 }}
          >
            {/* <div
              className={`h-[75%] w-[85%] rounded-3xl bg-gradient-to-br ${gradientClass} opacity-90 blur-xl`}
            /> */}
          </motion.div>
          <div className="relative flex h-full flex-col items-start justify-end rounded-[3rem] px-8 py-6">
            <div className="absolute top-6 right-6">
              <ArrowRight className="size-8 text-muted-foreground" />
            </div>
            <div className="flex flex-col justify-between text-start">
              <div className="mb-2 flex flex-col gap-1">
                <h2 className="font-medium text-lg text-primary md:text-xl">
                  {theme.name}
                </h2>
                <p className="line-clamp-3 text-muted-foreground text-sm md:text-base">
                  {theme.description}
                </p>
              </div>
              <p className="mt-1 text-muted-foreground/40 text-xs transition-colors duration-300 hover:text-muted-foreground">
                {theme.levels.length} levels to master
              </p>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
