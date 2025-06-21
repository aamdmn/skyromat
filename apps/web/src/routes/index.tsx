import { Link, createFileRoute } from '@tanstack/react-router';
import { CheckCircle, Circle } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { getAllLevels } from '../lib/levels';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

type CarouselItemType =
  | (ReturnType<typeof getAllLevels>[number] & { type: 'level' })
  | { type: 'divider'; id: string; name: string };

function HomeComponent() {
  const levels = getAllLevels();

  const carouselItems: CarouselItemType[] = React.useMemo(() => {
    const items: CarouselItemType[] = [];
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

  const firstLevelIndex = React.useMemo(
    () => carouselItems.findIndex((item) => item.type === 'level'),
    [carouselItems]
  );

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(firstLevelIndex);

  React.useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <motion.div
      className="flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Carousel
        setApi={setApi}
        opts={{
          align: 'center',
          loop: true,
          startIndex: firstLevelIndex,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-12 min-h-[300px]">
          {carouselItems.map((item) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={item.id}
                  className="min-w-0 shrink-0 grow-0 basis-full pl-12 md:basis-1/2 lg:basis-1/4"
                  aria-hidden="true"
                >
                  <div className="flex h-full items-center justify-center">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="h-10 w-px bg-current" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </div>
                </div>
              );
            }

            const level = item;
            const isActive = carouselItems[current]?.id === level.id;

            return (
              <CarouselItem
                key={level.id}
                className="pl-12 md:basis-1/2 lg:basis-1/4"
              >
                <div className="h-full">
                  <Link
                    to="/levels/$levelId"
                    params={{ levelId: level.id }}
                    className="block h-full"
                  >
                    <motion.div
                      className="relative h-full"
                      initial={false}
                      animate={isActive ? 'active' : 'inactive'}
                      variants={{
                        active: { scale: 1 },
                        inactive: { scale: 0.95 },
                      }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    >
                      <div className="absolute inset-0 rounded-[3rem] bg-[#EAEAEA]" />
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[3rem]"
                        variants={{
                          active: { opacity: 1 },
                          inactive: { opacity: 0 },
                        }}
                      >
                        <div className="h-64 w-80 rounded-3xl bg-gradient-to-br from-cyan-400 to-sky-600 opacity-90 blur-xl" />
                      </motion.div>
                      <div className="relative flex h-full flex-col items-start justify-end rounded-[3rem] px-10 py-7">
                        <div className="absolute top-6 right-6">
                          {isActive ? (
                            <Circle className="size-8 text-white/80" />
                          ) : (
                            <CheckCircle className="size-8 text-muted-foreground/30" />
                          )}
                        </div>
                        <div className="text-start">
                          <motion.h2
                            className="font-medium text-2xl"
                            variants={{
                              active: { color: 'hsl(210 40% 98%)' },
                              inactive: { color: 'hsl(222.2 84% 4.9%)' },
                            }}
                          >
                            {level.name}
                          </motion.h2>
                          <motion.p
                            className="mt-2 text-base"
                            variants={{
                              active: { color: 'hsla(210, 40%, 98%, 0.8)' },
                              inactive: { color: 'hsl(215.4 16.3% 46.9%)' },
                            }}
                          >
                            {level.description}
                          </motion.p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
      <div className="mt-10 flex items-center justify-center gap-3 py-6">
        {carouselItems.map((item, index) => {
          if (item.type === 'divider') {
            return null;
          }
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => api?.scrollTo(index)}
              className={cn(
                'h-[3.5px] cursor-pointer rounded-full transition-all duration-500',
                current === index
                  ? 'w-14 bg-primary'
                  : 'w-8 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
