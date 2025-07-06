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
  onCardRef: (index: number) => (el: HTMLDivElement | null) => void;
}

export function LevelCardsContainer({
  cardItems,
  activeIndex,
  onScrollRef,
  onCardRef,
}: LevelCardsContainerProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <div
        ref={onScrollRef}
        className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 h-full overflow-y-auto px-6 py-8"
      >
        <div className="mx-auto max-w-2xl space-y-8 pb-[40vh]">
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
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
