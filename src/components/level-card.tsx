import { CheckCircle, Circle, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LevelCardProps {
  level: {
    id: number;
    name: string;
    description?: string;
  };
  isActive: boolean;
  index: number;
  onRef: (el: HTMLDivElement | null) => void;
  isCompleted: boolean;
  isUnlocked: boolean;
}

export function LevelCard({
  level,
  isActive,
  index,
  onRef,
  isCompleted,
  isUnlocked,
}: LevelCardProps) {
  const content = (
    <motion.div
      animate={isActive ? 'active' : 'inactive'}
      className={cn(
        'relative h-64 w-full items-center justify-center overflow-hidden rounded-[3rem] md:h-80',
        !isUnlocked && 'opacity-50'
      )}
      initial={false}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      variants={{
        active: { scale: 1.02 },
        inactive: { scale: 1 },
      }}
      whileHover={isUnlocked ? { scale: 1.01 } : {}}
    >
      <motion.div
        className="absolute inset-0 rounded-[3rem]"
        variants={{
          active: { backgroundColor: 'hsl(var(--card))' },
          inactive: { backgroundColor: '#EAEAEA' },
        }}
      />
      <motion.div
        className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[3rem]"
        variants={{
          active: { opacity: 1 },
          inactive: { opacity: 0 },
        }}
      >
        <div className="h-[80%] w-[85%] rounded-3xl bg-gradient-to-br from-cyan-400 to-sky-600 opacity-90 blur-xl" />
      </motion.div>
      <div className="relative flex h-full flex-col items-start justify-end rounded-[3rem] px-8 py-6">
        <div className="absolute top-6 right-6">
          {isCompleted ? (
            <CheckCircle className="size-8 text-green-400" />
          ) : isUnlocked ? (
            <Circle className="size-8 text-white/80" />
          ) : (
            <Lock className="size-8 text-muted-foreground/30" />
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
  );

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2/3"
      initial={{ opacity: 0, y: 20 }}
      ref={onRef}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {isUnlocked ? (
        <Link className="block" href={`/levels/${level.id}`}>
          {content}
        </Link>
      ) : (
        <div className="cursor-not-allowed">{content}</div>
      )}
    </motion.div>
  );
}
