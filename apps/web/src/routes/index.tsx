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
    <div className="flex h-screen w-full flex-col items-center bg-background">
      <motion.div
        className="flex h-screen w-full max-w-[98rem] flex-col items-center bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full px-8 py-8 text-start">
          <h1 className="font-semibold text-2xl">Vitajte v SkyroMat!</h1>
          <p className="text-muted-foreground">
            Preskúmaj levely a vylepš svoje zručnosti.
          </p>
        </div>
        <div className="w-full flex-grow overflow-y-auto px-4 pb-8">
          <div className="grid max-w-8xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {themes.map((theme, index) => (
              <ThemeCard key={theme.id} theme={theme} index={index} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
