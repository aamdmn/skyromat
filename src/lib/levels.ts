import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { exercises, levels, themes } from '@/db/schema';

export interface Exercise {
  id: number;
  type: string;
  question?: string | null;
  options: string[];
  correctAnswer: string;
  explanation?: string | null;
  levelId: number;
}

export interface Level {
  id: number;
  name: string;
  difficulty: number;
  description: string | null;
  exercises: Exercise[];
  themeId: number;
  themeName: string;
}

export interface Theme {
  id: number;
  name: string;
  description: string | null;
  levels: Level[];
  userId: string;
}

export async function getAllThemes(): Promise<Theme[]> {
  const themesResult = await db.select().from(themes);

  const themesWithLevels = await Promise.all(
    themesResult.map(async (theme) => {
      const levelsResult = await db
        .select()
        .from(levels)
        .where(eq(levels.themeId, theme.id))
        .orderBy(asc(levels.difficulty));

      const levelsWithExercises = await Promise.all(
        levelsResult.map(async (level) => {
          const exercisesResult = await db
            .select()
            .from(exercises)
            .where(eq(exercises.levelId, level.id));

          return {
            ...level,
            exercises: exercisesResult.map((ex) => ({
              ...ex,
              options: (ex.options as string[]) || [],
            })),
            themeId: theme.id,
            themeName: theme.name,
          };
        })
      );

      return {
        ...theme,
        levels: levelsWithExercises,
      };
    })
  );

  return themesWithLevels;
}

export async function getAllLevels(): Promise<Level[]> {
  const allThemes = await getAllThemes();
  return allThemes.flatMap((theme) => theme.levels);
}

export async function getLevelById(
  levelId: number
): Promise<Level | undefined> {
  const levelResult = await db
    .select()
    .from(levels)
    .where(eq(levels.id, levelId))
    .limit(1);

  if (levelResult.length === 0) {
    return;
  }

  const level = levelResult[0];

  // Get theme info
  const themeResult = await db
    .select()
    .from(themes)
    .where(eq(themes.id, level.themeId))
    .limit(1);

  if (themeResult.length === 0) {
    return;
  }

  const theme = themeResult[0];

  // Get exercises
  const exercisesResult = await db
    .select()
    .from(exercises)
    .where(eq(exercises.levelId, level.id));

  return {
    ...level,
    exercises: exercisesResult.map((ex) => ({
      ...ex,
      options: (ex.options as string[]) || [],
    })),
    themeId: theme.id,
    themeName: theme.name,
  };
}

export async function getThemeById(
  themeId: number
): Promise<Theme | undefined> {
  const themeResult = await db
    .select()
    .from(themes)
    .where(eq(themes.id, themeId))
    .limit(1);

  if (themeResult.length === 0) {
    return;
  }

  const theme = themeResult[0];

  const levelsResult = await db
    .select()
    .from(levels)
    .where(eq(levels.themeId, theme.id))
    .orderBy(asc(levels.difficulty));

  const levelsWithExercises = await Promise.all(
    levelsResult.map(async (level) => {
      const exercisesResult = await db
        .select()
        .from(exercises)
        .where(eq(exercises.levelId, level.id));

      return {
        ...level,
        exercises: exercisesResult.map((ex) => ({
          ...ex,
          options: (ex.options as string[]) || [],
        })),
        themeId: theme.id,
        themeName: theme.name,
      };
    })
  );

  return {
    ...theme,
    levels: levelsWithExercises,
  };
}

export async function getLevelByDifficulty(
  difficulty: number
): Promise<Level | undefined> {
  const allLevels = await getAllLevels();
  return allLevels.find((level) => level.difficulty === difficulty);
}

export async function getExerciseById(
  levelId: number,
  exerciseId: number
): Promise<Exercise | undefined> {
  const exerciseResult = await db
    .select()
    .from(exercises)
    .where(eq(exercises.id, exerciseId))
    .limit(1);

  if (exerciseResult.length === 0) {
    return;
  }

  const exercise = exerciseResult[0];

  // Verify the exercise belongs to the specified level
  if (exercise.levelId !== levelId) {
    return;
  }

  return {
    ...exercise,
    options: (exercise.options as string[]) || [],
  };
}

export async function getNextLevel(
  currentLevelId: number
): Promise<Level | undefined> {
  const allLevels = await getAllLevels();
  const currentIndex = allLevels.findIndex(
    (level) => level.id === currentLevelId
  );
  if (currentIndex === -1 || currentIndex === allLevels.length - 1) {
    return;
  }
  return allLevels[currentIndex + 1];
}

export async function getPreviousLevel(
  currentLevelId: number
): Promise<Level | undefined> {
  const allLevels = await getAllLevels();
  const currentIndex = allLevels.findIndex(
    (level) => level.id === currentLevelId
  );
  if (currentIndex <= 0) {
    return;
  }
  return allLevels[currentIndex - 1];
}
