import { CheckCircle, Lock } from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

interface LevelItem {
  id: string;
  name: string;
  type: 'level';
}

interface LevelNavigationSidebarProps {
  levelItems: LevelItem[];
  activeIndex: number;
  onLevelClick: (index: number) => void;
  cardItems: Array<{ id: string; type: 'level' | 'divider' }>;
  isLevelCompleted: (levelId: string) => boolean;
  isLevelUnlocked: (levelId: string) => boolean;
}

export function LevelNavigationSidebar({
  levelItems,
  activeIndex,
  onLevelClick,
  cardItems,
  isLevelCompleted,
  isLevelUnlocked,
}: LevelNavigationSidebarProps) {
  return (
    <div className="relative w-72 bg-gradient-to-r from-background to-background/50">
      {/* Vertical Line */}
      <div className="absolute top-0 bottom-0 left-12 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

      <div className="flex h-full flex-col justify-center py-8 pl-4">
        <div className="space-y-4">
          {levelItems.map((item, levelIndex) => {
            const actualIndex = cardItems.findIndex((ci) => ci.id === item.id);
            const isActive = cardItems[activeIndex]?.id === item.id;
            const isCompleted = isLevelCompleted(item.id);
            const isUnlocked = isLevelUnlocked(item.id);

            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => isUnlocked && onLevelClick(actualIndex)}
                className={cn(
                  'relative flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left transition-all',
                  {
                    'hover:bg-muted/30': isUnlocked,
                    'cursor-not-allowed': !isUnlocked,
                  }
                )}
                whileHover={isUnlocked ? { x: 8, scale: 1.02 } : {}}
                whileTap={isUnlocked ? { scale: 0.98 } : {}}
                aria-label={`Go to ${item.name}`}
                disabled={!isUnlocked}
              >
                {/* Dot on the line */}
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                  <motion.div
                    className={cn(
                      'h-3 w-3 rounded-full border-2 transition-all duration-300',
                      {
                        'border-primary bg-primary shadow-lg shadow-primary/40':
                          isActive && isUnlocked,
                        'border-green-500 bg-green-500': isCompleted,
                        'border-muted-foreground/20 bg-background':
                          !isActive && !isCompleted,
                        'hover:border-muted-foreground/70':
                          isUnlocked && !isCompleted && !isActive,
                      }
                    )}
                    animate={isActive ? { scale: 1.3 } : { scale: 1 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  />
                  {isCompleted && (
                    <CheckCircle className="absolute h-4 w-4 text-white" />
                  )}
                  {!isUnlocked && (
                    <Lock className="absolute h-4 w-4 text-muted-foreground/50" />
                  )}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/20 blur-sm"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 2, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>

                {/* Level name */}
                <div className="min-w-0 flex-1">
                  <motion.span
                    className={cn(
                      'block truncate font-medium text-sm transition-colors',
                      {
                        'text-primary': isActive && isUnlocked,
                        'text-green-500': isCompleted,
                        'text-muted-foreground': !isActive && !isCompleted,
                        'hover:text-foreground': isUnlocked && !isActive,
                        'text-muted-foreground/50': !isUnlocked,
                      }
                    )}
                    animate={isActive ? { opacity: 1 } : { opacity: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.name}
                  </motion.span>
                  <motion.div
                    className={cn(
                      'mt-0.5 text-xs transition-colors',
                      isActive ? 'text-primary/70' : 'text-muted-foreground/60'
                    )}
                  >
                    Level {levelIndex + 1}
                  </motion.div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="h-8 w-1 rounded-full bg-gradient-to-b from-primary/50 to-primary"
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
