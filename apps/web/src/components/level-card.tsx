import { Link } from '@tanstack/react-router';
import { CheckCircle, Circle } from 'lucide-react';
import { motion } from 'motion/react';

interface LevelCardProps {
  level: {
    id: string;
    name: string;
    description?: string;
  };
  isActive: boolean;
  index: number;
  onRef: (el: HTMLDivElement | null) => void;
}

export function LevelCard({ level, isActive, index, onRef }: LevelCardProps) {
  return (
    <motion.div
      ref={onRef}
      className="mx-auto max-w-2/3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to="/levels/$levelId"
        params={{ levelId: level.id }}
        className="block"
      >
        <motion.div
          className="relative h-64 w-full items-center justify-center overflow-hidden rounded-[3rem] md:h-80"
          initial={false}
          animate={isActive ? 'active' : 'inactive'}
          variants={{
            active: { scale: 1.02 },
            inactive: { scale: 1 },
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          whileHover={{ scale: 1.01 }}
        >
          <div className="absolute inset-0 rounded-[3rem] bg-[#EAEAEA]" />
          <motion.div
            className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[3rem]"
            variants={{
              active: { opacity: 1 },
              inactive: { opacity: 0 },
            }}
          >
            <div className="h-64 w-96 rounded-3xl bg-gradient-to-br from-cyan-400 to-sky-600 opacity-90 blur-xl" />
          </motion.div>
          <div className="relative flex h-full flex-col items-start justify-end rounded-[3rem] px-8 py-6">
            <div className="absolute top-6 right-6">
              {isActive ? (
                <Circle className="size-8 text-white/80" />
              ) : (
                <CheckCircle className="size-8 text-muted-foreground/30" />
              )}
            </div>
            <div className="text-start">
              <motion.h2
                className="font-medium text-lg md:text-xl"
                variants={{
                  active: { color: 'hsl(210 40% 98%)' },
                  inactive: { color: 'hsl(222.2 84% 4.9%)' },
                }}
              >
                {level.name}
              </motion.h2>
              {level.description && (
                <motion.p
                  className="mt-2 line-clamp-3 text-sm md:text-base"
                  variants={{
                    active: { color: 'hsla(210, 40%, 98%, 0.8)' },
                    inactive: { color: 'hsl(215.4 16.3% 46.9%)' },
                  }}
                >
                  {level.description}
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
