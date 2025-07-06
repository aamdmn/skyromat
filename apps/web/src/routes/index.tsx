import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'motion/react';
import React from 'react';

import { LevelCardsContainer } from '@/components/level-cards-container';
import { LevelNavigationSidebar } from '@/components/level-navigation-sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useLevelScroll } from '@/hooks/use-level-scroll';
import { getAllLevels } from '../lib/levels';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

type CardItemType =
  | (ReturnType<typeof getAllLevels>[number] & { type: 'level' })
  | { type: 'divider'; id: string; name: string };

function HomeComponent() {
  const levels = getAllLevels();

  const cardItems: CardItemType[] = React.useMemo(() => {
    const items: CardItemType[] = [];
    let lastThemeId = '';
    for (const level of levels) {
      if (level.themeId !== lastThemeId) {
        items.push({
          type: 'divider',
          id: `divider-${level.themeId}`,
          name: level.themeName,
        });
        lastThemeId = level.themeId;
      }
      items.push({ ...level, type: 'level' });
    }
    return items;
  }, [levels]);

  const levelItems = React.useMemo(
    () => cardItems.filter((item) => item.type === 'level'),
    [cardItems]
  );

  const { activeIndex, scrollContainerRef, scrollToCard, setCardRef } =
    useLevelScroll(cardItems);

  return (
    <TooltipProvider>
      <motion.div
        className="flex h-screen w-full bg-background pl-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <LevelNavigationSidebar
          levelItems={levelItems}
          activeIndex={activeIndex}
          onLevelClick={scrollToCard}
          cardItems={cardItems}
        />

        <LevelCardsContainer
          cardItems={cardItems}
          activeIndex={activeIndex}
          onScrollRef={scrollContainerRef}
          onCardRef={setCardRef}
        />
      </motion.div>
    </TooltipProvider>
  );
}
