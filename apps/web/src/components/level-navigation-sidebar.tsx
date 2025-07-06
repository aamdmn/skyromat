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
}

export function LevelNavigationSidebar({
  levelItems,
  activeIndex,
  onLevelClick,
  cardItems,
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

            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => onLevelClick(actualIndex)}
                className="relative flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left transition-all hover:bg-muted/30"
                whileHover={{ x: 8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label={`Go to ${item.name}`}
              >
                {/* Dot on the line */}
                <div className="relative flex h-8 w-8 items-center justify-center">
                  <motion.div
                    className={cn(
                      'h-3 w-3 rounded-full border-2 transition-all duration-300',
                      isActive
                        ? 'border-primary bg-primary shadow-lg shadow-primary/40'
                        : 'border-muted-foreground/40 bg-background hover:border-muted-foreground/70'
                    )}
                    animate={isActive ? { scale: 1.3 } : { scale: 1 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  />
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
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
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
