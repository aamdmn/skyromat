import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';

import { LevelCardsContainer } from '@/components/level-cards-container';
import { LevelNavigationSidebar } from '@/components/level-navigation-sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useLevelScroll } from '@/hooks/use-level-scroll';
import { useProgress } from '@/hooks/use-progress';
import { type Level, getThemeById } from '@/lib/levels';

export const Route = createFileRoute('/themes/$themeId')({
  component: ThemePage,
});

type CardItemType =
  | (Level & { type: 'level' })
  | { type: 'divider'; id: string; name: string };

function ThemePage() {
  const { themeId } = Route.useParams();
  const theme = getThemeById(themeId);
  const levels = React.useMemo(() => theme?.levels ?? [], [theme]);

  const { isLevelCompleted, isLevelUnlocked } = useProgress(levels);

  const cardItems = React.useMemo(() => {
    if (!theme) return [];
    // The type assertion is needed because Level has more properties than CardItem expects for 'level' type
    return theme.levels.map((level) => ({ ...level, type: 'level' as const }));
  }, [theme]);

  const levelItems = React.useMemo(
    () =>
      cardItems.filter(
        (item): item is Level & { type: 'level' } => item.type === 'level'
      ),
    [cardItems]
  );

  const { activeIndex, scrollContainerRef, scrollToCard, setCardRef } =
    useLevelScroll(cardItems);

  const [headerStyle, setHeaderStyle] = useState({});

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const scrollFraction = Math.min(scrollTop / 50, 1);

      setHeaderStyle({
        opacity: 1 - scrollFraction * 0.1,
        backdropFilter: `blur(${scrollFraction * 8}px)`,
        WebkitBackdropFilter: `blur(${scrollFraction * 8}px)`,
      });
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef.current]);

  if (!theme) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <h1 className="font-bold text-4xl">Téma nenájdená</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Ľutujeme, ale téma, ktorú hľadáte, neexistuje.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Späť na hlavnú stránku
        </Link>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        className="relative flex h-screen w-full flex-col overflow-hidden bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div
          style={headerStyle}
          className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-transparent px-8 py-4 transition-all duration-200"
        >
          <Link
            to="/"
            className="flex items-center text-muted-foreground text-sm hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Späť na témy</span>
          </Link>
        </div>
        <div className="flex flex-grow overflow-hidden pt-16">
          <LevelNavigationSidebar
            levelItems={levelItems}
            activeIndex={activeIndex}
            onLevelClick={scrollToCard}
            cardItems={cardItems}
            isLevelCompleted={isLevelCompleted}
            isLevelUnlocked={isLevelUnlocked}
          />

          <LevelCardsContainer
            cardItems={cardItems}
            activeIndex={activeIndex}
            onScrollRef={scrollContainerRef}
            onCardRef={setCardRef}
            themeName={theme.name}
            themeDescription={theme.description}
            isLevelCompleted={isLevelCompleted}
            isLevelUnlocked={isLevelUnlocked}
            headerStyle={headerStyle}
          />
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
