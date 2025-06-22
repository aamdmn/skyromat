import { Link } from '@tanstack/react-router';
import { motion } from 'motion/react';

interface Level {
  name: string;
  description: string;
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
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Link
          to="/"
          className="text-muted-foreground transition-colors hover:text-primary"
        >
          ← Späť na úrovne
        </Link>
      </motion.div>

      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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
