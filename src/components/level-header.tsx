import { motion } from 'motion/react';
import Link from 'next/link';

interface Level {
  name: string;
  description: string;
  themeId: string;
}

interface LevelHeaderProps {
  level: Level;
  currentExerciseIndex: number;
  totalExercises: number;
}

export function LevelHeader({
  level,
  currentExerciseIndex,
  totalExercises,
}: LevelHeaderProps) {
  return (
    <>
      <motion.div
        animate={{ opacity: 1 }}
        className="mb-6"
        initial={{ opacity: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Link
          className="text-muted-foreground transition-colors hover:text-primary"
          href={`/themes/${level.themeId}`}
        >
          ← Späť na úrovne
        </Link>
      </motion.div>

      <motion.div
        animate={{ opacity: 1 }}
        className="mb-8"
        initial={{ opacity: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <h1 className="mb-2 font-semibold text-3xl">{level.name}</h1>
        <p className="text-lg text-muted-foreground">{level.description}</p>
        <div className="mt-2 text-muted-foreground text-sm">
          Cvičenie {currentExerciseIndex + 1} z {totalExercises}
        </div>
      </motion.div>
    </>
  );
}
