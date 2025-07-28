import React from 'react';

interface CardItem {
  id: string;
  type: 'level' | 'divider';
}

export function useLevelScroll(cardItems: CardItem[]) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const scrollToCard = React.useCallback((index: number) => {
    const targetCard = cardRefs.current[index];
    if (targetCard && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetCard.getBoundingClientRect();

      // Center the target card in the viewport
      const containerCenter = containerRect.height / 2;
      const cardCenter = targetRect.height / 2;
      const scrollTop =
        container.scrollTop +
        targetRect.top -
        containerRect.top -
        containerCenter +
        cardCenter;

      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      });
    }
  }, []);

  const setCardRef = React.useCallback((index: number) => {
    return (el: HTMLDivElement | null) => {
      cardRefs.current[index] = el;
    };
  }, []);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      cardRefs.current.forEach((card, index) => {
        if (card && cardItems[index]?.type === 'level') {
          const cardRect = card.getBoundingClientRect();
          const cardCenter = cardRect.top + cardRect.height / 2;
          const distance = Math.abs(cardCenter - containerCenter);

          // Only consider cards that are at least partially visible
          const isVisible =
            cardRect.bottom > containerRect.top &&
            cardRect.top < containerRect.bottom;

          if (isVisible && distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        }
      });

      setActiveIndex(closestIndex);
    };

    // Debounce the scroll handler to improve performance
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 50);
    };

    container.addEventListener('scroll', debouncedHandleScroll);
    handleScroll(); // Initial check

    return () => {
      container.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [cardItems]);

  return {
    activeIndex,
    scrollContainerRef,
    scrollToCard,
    setCardRef,
  };
}
