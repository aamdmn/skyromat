import type React from 'react';
import { LevelCard } from './level-card';
import { LevelDivider } from './level-divider';

interface CardItem {
  id: string;
  type: 'level' | 'divider';
  name: string;
  description?: string;
  themeId?: string;
  themeName?: string;
}

interface LevelCardsContainerProps {
  cardItems: CardItem[];
  activeIndex: number;
  onScrollRef: React.RefObject<HTMLDivElement | null>;
  themeName: string;
  themeDescription: string;
  onCardRef: (index: number) => (el: HTMLDivElement | null) => void;
  isLevelCompleted: (levelId: string) => boolean;
  isLevelUnlocked: (levelId: string) => boolean;
  headerStyle: React.CSSProperties;
}

export function LevelCardsContainer({
  cardItems,
  activeIndex,
  onScrollRef,
  onCardRef,
  isLevelCompleted,
  isLevelUnlocked,
  themeName,
  themeDescription,
  headerStyle,
}: LevelCardsContainerProps) {
  return (
    <div className="relative z-10 flex-1 overflow-hidden">
      <div
        style={headerStyle}
        className="absolute inset-x-0 top-0 z-10 bg-background/80 py-4 text-center transition-all duration-200"
      >
        <h1 className="font-bold text-3xl">{themeName}</h1>
        <p className="text-md text-muted-foreground">{themeDescription}</p>
      </div>
      <div
        ref={onScrollRef}
        className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 h-full overflow-y-auto px-6"
      >
        <div className="mx-auto max-w-2xl space-y-8 pt-28 pb-[40vh]">
          {cardItems.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div key={item.id} ref={onCardRef(index)}>
                  <LevelDivider name={item.name} />
                </div>
              );
            }

            const level = item as CardItem & { type: 'level' };
            const isActive = cardItems[activeIndex]?.id === level.id;

            return (
              <LevelCard
                key={level.id}
                level={level}
                isActive={isActive}
                index={index}
                onRef={onCardRef(index)}
                isCompleted={isLevelCompleted(level.id)}
                isUnlocked={isLevelUnlocked(level.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
