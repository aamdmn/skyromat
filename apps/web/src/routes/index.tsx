import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'motion/react';

import { ThemeCard } from '@/components/theme-card';
import { getAllThemes } from '../lib/levels';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  const themes = getAllThemes();

  return (
    <motion.div
      className="flex h-screen w-full flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="py-8 text-center">
        <h1 className="font-bold text-4xl">Vitajte v Skyro-Matika!</h1>
        <p className="text-lg text-muted-foreground">
          Preskúmajte svety matematiky a vylepšite svoje zručnosti.
        </p>
      </div>
      <div className="flex-grow overflow-y-auto px-4 pb-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
