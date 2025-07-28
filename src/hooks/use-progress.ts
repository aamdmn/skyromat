import { useCallback, useEffect, useState } from 'react';
import type { Level } from '@/lib/levels';

const PROGRESS_STORAGE_KEY = 'skyro-matika-progress';

interface Progress {
  completedLevels: string[];
}

function getProgress(): Progress {
  try {
    const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (savedProgress) {
      return JSON.parse(savedProgress);
    }
  } catch (error) {
    console.error('Error reading progress from localStorage', error);
  }
  return { completedLevels: [] };
}

function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress to localStorage', error);
  }
}

export function useProgress(levels: Level[]) {
  const [progress, setProgress] = useState<Progress>({ completedLevels: [] });

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const completeLevel = useCallback((levelId: string) => {
    setProgress((prevProgress) => {
      if (prevProgress.completedLevels.includes(levelId)) {
        return prevProgress;
      }
      const newProgress: Progress = {
        ...prevProgress,
        completedLevels: [...prevProgress.completedLevels, levelId],
      };
      saveProgress(newProgress);
      return newProgress;
    });
  }, []);

  const isLevelCompleted = useCallback(
    (levelId: string) => {
      return progress.completedLevels.includes(levelId);
    },
    [progress.completedLevels]
  );

  const isLevelUnlocked = useCallback(
    (levelId: string) => {
      const levelIndex = levels.findIndex((l) => l.id === levelId);
      if (levelIndex === -1) return false;
      if (levelIndex === 0) return true;

      const previousLevel = levels[levelIndex - 1];
      return isLevelCompleted(previousLevel.id);
    },
    [levels, isLevelCompleted]
  );

  return {
    completedLevels: progress.completedLevels,
    completeLevel,
    isLevelCompleted,
    isLevelUnlocked,
  };
}
