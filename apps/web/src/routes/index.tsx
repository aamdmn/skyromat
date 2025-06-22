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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
    <TooltipProvider>
      <motion.div
        className="flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full max-w-screen px-4">
          <Carousel
            setApi={setApi}
            opts={{
              align: 'center',
              loop: true,
              startIndex: firstLevelIndex,
            }}
            className="w-full overflow-hidden"
          >
            <CarouselContent className="-ml-4 min-h-[350px]">
              {carouselItems.map((item) => {
                if (item.type === 'divider') {
                  return (
                    <div
                      key={item.id}
                      className="min-w-0 shrink-0 grow-0 basis-full pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/5 xl:basis-1/6"
                      aria-hidden="true"
                    >
                      <div className="flex h-full items-center justify-center">
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="h-8 w-px bg-current" />
                          <span className="font-medium text-sm">
                            {item.name}
                          </span>
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
                    className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/5 xl:basis-1/5"
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
                            <div className="h-64 w-64 rounded-3xl bg-gradient-to-br from-cyan-400 to-sky-600 opacity-90 blur-xl" />
                          </motion.div>
                          <div className="relative flex h-full flex-col items-start justify-end rounded-[3rem] px-6 py-5">
                            <div className="absolute top-4 right-4">
                              {isActive ? (
                                <Circle className="size-6 text-white/80" />
                              ) : (
                                <CheckCircle className="size-6 text-muted-foreground/30" />
                              )}
                            </div>
                            <div className="text-start">
                              <motion.h2
                                className="font-medium text-lg lg:text-xl"
                                variants={{
                                  active: { color: 'hsl(210 40% 98%)' },
                                  inactive: { color: 'hsl(222.2 84% 4.9%)' },
                                }}
                              >
                                {level.name}
                              </motion.h2>
                              <motion.p
                                className="mt-1 line-clamp-2 text-sm lg:text-base"
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
          <div className="mt-14 flex items-center justify-center gap-2 py-4">
            {carouselItems
              .filter((item) => item.type === 'level')
              .map((item, _levelIndex) => {
                const actualIndex = carouselItems.findIndex(
                  (ci) => ci.id === item.id
                );
                const isCurrentLevel = carouselItems[current]?.id === item.id;

                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <motion.button
                        type="button"
                        onClick={() => api?.scrollTo(actualIndex)}
                        className="-m-2 relative cursor-pointer p-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Go to ${item.name}`}
                      >
                        <div
                          className={cn(
                            'h-1 rounded-full transition-all duration-300',
                            isCurrentLevel
                              ? 'w-12 bg-primary'
                              : 'w-6 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                          )}
                        />
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-[250px] text-center"
                      sideOffset={8}
                    >
                      <span className="font-normal text-xs">{item.name}</span>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            {carouselItems.filter((item) => item.type === 'level').length >
              12 && (
              <div className="ml-2 text-muted-foreground text-xs">
                +
                {carouselItems.filter((item) => item.type === 'level').length -
                  12}{' '}
                more
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
