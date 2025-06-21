import levelsData from '../data/levels.json';

export interface Exercise {
  id: string;
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Level {
  id: string;
  name: string;
  difficulty: number;
  description: string;
  exercises: Exercise[];
  themeId: string;
  themeName: string;
}

export interface Theme {
  id: string;
  name: string;
  levels: Level[];
}

export interface LevelsData {
  themes: Theme[];
}

// Type assertion for the imported JSON
const typedLevelsData = levelsData as unknown as LevelsData;

export function getAllThemes(): Theme[] {
  return typedLevelsData.themes;
}

export function getAllLevels(): Level[] {
  return typedLevelsData.themes.flatMap((theme) =>
    theme.levels.map((level) => ({
      ...level,
      themeId: theme.id,
      themeName: theme.name,
    }))
  );
}

export function getLevelById(levelId: string): Level | undefined {
  return getAllLevels().find((level) => level.id === levelId);
}

export function getLevelByDifficulty(difficulty: number): Level | undefined {
  return getAllLevels().find((level) => level.difficulty === difficulty);
}

export function getExerciseById(
  levelId: string,
  exerciseId: string
): Exercise | undefined {
  const level = getLevelById(levelId);
  return level?.exercises.find((exercise) => exercise.id === exerciseId);
}

export function getNextLevel(currentLevelId: string): Level | undefined {
  const allLevels = getAllLevels();
  const currentIndex = allLevels.findIndex(
    (level) => level.id === currentLevelId
  );
  if (currentIndex === -1 || currentIndex === allLevels.length - 1) {
    return undefined;
  }
  return allLevels[currentIndex + 1];
}

export function getPreviousLevel(currentLevelId: string): Level | undefined {
  const allLevels = getAllLevels();
  const currentIndex = allLevels.findIndex(
    (level) => level.id === currentLevelId
  );
  if (currentIndex <= 0) {
    return undefined;
  }
  return allLevels[currentIndex - 1];
}
