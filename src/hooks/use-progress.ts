import { useCallback, useEffect, useState } from 'react';
import type { Level } from '@/lib/levels';
import {
  completeLevel as completeLevelServer,
  getUserProgress,
} from '@/lib/progress-actions';

const PROGRESS_STORAGE_KEY = 'skyro-matika-progress';

interface Progress {
  completedLevels: number[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

function getLocalProgress(): { completedLevels: number[] } {
  try {
    const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      // Handle legacy string format
      if (
        Array.isArray(parsed.completedLevels) &&
        parsed.completedLevels.length > 0
      ) {
        const converted = parsed.completedLevels.map((id: string | number) =>
          typeof id === 'string' ? Number.parseInt(id, 10) : id
        );
        return { completedLevels: converted };
      }
      return { completedLevels: parsed.completedLevels || [] };
    }
  } catch (error) {
    console.error('Error reading progress from localStorage', error);
  }
  return { completedLevels: [] };
}

function saveLocalProgress(completedLevels: number[]) {
  try {
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ completedLevels })
    );
  } catch (error) {
    console.error('Error saving progress to localStorage', error);
  }
}

export function useProgress(levels: Level[]) {
  const [progress, setProgress] = useState<Progress>({
    completedLevels: [],
    isLoading: true,
    isAuthenticated: false,
  });

  // Load progress on mount
  useEffect(() => {
    async function loadProgress() {
      try {
        // First, try to load from server
        const serverProgress = await getUserProgress();

        if (serverProgress.success) {
          const completedLevelIds = serverProgress.data.map((p) => p.levelId);
          setProgress({
            completedLevels: completedLevelIds,
            isLoading: false,
            isAuthenticated: true,
          });
          // Sync to localStorage
          saveLocalProgress(completedLevelIds);
        } else {
          // Fallback to localStorage if server fails or user not authenticated
          const localProgress = getLocalProgress();
          setProgress({
            completedLevels: localProgress.completedLevels,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        // Fallback to localStorage if there's an error
        console.error('Error loading progress:', error);
        const localProgress = getLocalProgress();
        setProgress({
          completedLevels: localProgress.completedLevels,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    }

    loadProgress();
  }, []);

  const completeLevel = useCallback(async (levelId: number) => {
    // Optimistically update UI
    setProgress((prevProgress) => {
      if (prevProgress.completedLevels.includes(levelId)) {
        return prevProgress;
      }
      const newCompletedLevels = [...prevProgress.completedLevels, levelId];
      // Save to localStorage immediately for better UX
      saveLocalProgress(newCompletedLevels);
      return {
        ...prevProgress,
        completedLevels: newCompletedLevels,
      };
    });

    // Try to save to server if authenticated
    try {
      const result = await completeLevelServer(levelId);
      if (!result.success) {
        console.error('Failed to save progress to server:', result.message);
        // Progress is already saved locally, so we don't need to revert
      }
    } catch (error) {
      console.error('Error saving progress to server:', error);
      // Progress is already saved locally, so we don't need to revert
    }
  }, []);

  const isLevelCompleted = useCallback(
    (levelId: number) => {
      return progress.completedLevels.includes(levelId);
    },
    [progress.completedLevels]
  );

  const isLevelUnlocked = useCallback(
    (levelId: number) => {
      // TEMPORARY: For debugging, unlock all levels
      // TODO: Remove this when debugging is complete
      if (
        typeof window !== 'undefined' &&
        window.location.search.includes('debug=true')
      ) {
        return true;
      }

      // If still loading progress, only unlock the first level
      if (progress.isLoading) {
        const levelIndex = levels.findIndex((l) => l.id === levelId);
        return levelIndex === 0;
      }

      const levelIndex = levels.findIndex((l) => l.id === levelId);

      if (levelIndex === -1) {
        return false;
      }
      if (levelIndex === 0) {
        return true;
      }

      const previousLevel = levels[levelIndex - 1];
      return isLevelCompleted(previousLevel.id);
    },
    [levels, isLevelCompleted, progress.isLoading]
  );

  return {
    completedLevels: progress.completedLevels,
    completeLevel,
    isLevelCompleted,
    isLevelUnlocked,
    isLoading: progress.isLoading,
    isAuthenticated: progress.isAuthenticated,
  };
}
