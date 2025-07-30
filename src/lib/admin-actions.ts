'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/db';
import { exercises, levels, themes } from '@/db/schema';
import { auth } from '@/lib/auth';

// Validation schemas
const themeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const levelSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  difficulty: z.coerce.number().min(1, 'Difficulty must be at least 1'),
  themeId: z.coerce.number().min(1, 'Theme ID is required'),
});

const exerciseSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  question: z.string().optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  explanation: z.string().optional(),
  levelId: z.coerce.number().min(1, 'Level ID is required'),
});

// Auth helper
async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  return session.user;
}

// Fetch functions for server components
export async function getThemesForAdmin() {
  const user = await getAuthenticatedUser();

  try {
    const allThemes = await db
      .select()
      .from(themes)
      .where(eq(themes.userId, user.id));

    return { success: true, data: allThemes, error: null };
  } catch {
    return { success: false, data: [], error: 'Failed to fetch themes' };
  }
}

export async function getLevelsForAdmin() {
  const user = await getAuthenticatedUser();

  try {
    // Get levels for themes owned by the user
    const userThemes = await db
      .select({ id: themes.id })
      .from(themes)
      .where(eq(themes.userId, user.id));

    const themeIds = userThemes.map((t) => t.id);

    if (themeIds.length === 0) {
      return { success: true, data: [], error: null };
    }

    const allLevels = await db
      .select({
        id: levels.id,
        name: levels.name,
        description: levels.description,
        difficulty: levels.difficulty,
        themeId: levels.themeId,
        themeName: themes.name,
      })
      .from(levels)
      .innerJoin(themes, eq(levels.themeId, themes.id))
      .where(eq(themes.userId, user.id));

    return { success: true, data: allLevels, error: null };
  } catch {
    return { success: false, data: [], error: 'Failed to fetch levels' };
  }
}

export async function getExercisesForAdmin() {
  const user = await getAuthenticatedUser();

  try {
    // Get exercises for levels in themes owned by the user
    const allExercises = await db
      .select({
        id: exercises.id,
        type: exercises.type,
        question: exercises.question,
        options: exercises.options,
        correctAnswer: exercises.correctAnswer,
        explanation: exercises.explanation,
        levelId: exercises.levelId,
        levelName: levels.name,
        themeName: themes.name,
      })
      .from(exercises)
      .innerJoin(levels, eq(exercises.levelId, levels.id))
      .innerJoin(themes, eq(levels.themeId, themes.id))
      .where(eq(themes.userId, user.id));

    return { success: true, data: allExercises, error: null };
  } catch {
    return { success: false, data: [], error: 'Failed to fetch exercises' };
  }
}

// Theme actions
export async function createTheme(
  _prevState: {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
  },
  formData: FormData
) {
  const user = await getAuthenticatedUser();

  const rawFormData = {
    name: formData.get('name'),
    description: formData.get('description'),
  };

  const validatedFields = themeSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  try {
    const [newTheme] = await db
      .insert(themes)
      .values({
        name: validatedFields.data.name,
        description: validatedFields.data.description || '',
        userId: user.id,
      })
      .returning();

    revalidatePath('/admin');
    return {
      success: true,
      data: newTheme,
      message: 'Theme created successfully!',
    };
  } catch {
    return {
      success: false,
      message: 'Failed to create theme',
    };
  }
}

export async function updateTheme(
  id: number,
  _prevState: {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
  },
  formData: FormData
) {
  const user = await getAuthenticatedUser();

  const rawFormData = {
    name: formData.get('name'),
    description: formData.get('description'),
  };

  const validatedFields = themeSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  try {
    // Verify ownership
    const [existingTheme] = await db
      .select()
      .from(themes)
      .where(eq(themes.id, id))
      .limit(1);

    if (!existingTheme || existingTheme.userId !== user.id) {
      return {
        success: false,
        message: 'Theme not found or access denied',
      };
    }

    const [updatedTheme] = await db
      .update(themes)
      .set({
        name: validatedFields.data.name,
        description: validatedFields.data.description || '',
      })
      .where(eq(themes.id, id))
      .returning();

    revalidatePath('/admin');
    return {
      success: true,
      data: updatedTheme,
      message: 'Theme updated successfully!',
    };
  } catch {
    return {
      success: false,
      message: 'Failed to update theme',
    };
  }
}

export async function deleteTheme(id: number) {
  const user = await getAuthenticatedUser();

  try {
    // Verify ownership
    const [existingTheme] = await db
      .select()
      .from(themes)
      .where(eq(themes.id, id))
      .limit(1);

    if (!existingTheme || existingTheme.userId !== user.id) {
      return {
        success: false,
        message: 'Theme not found or access denied',
      };
    }

    await db.delete(themes).where(eq(themes.id, id));

    revalidatePath('/admin');
    return {
      success: true,
      message: 'Theme deleted successfully!',
    };
  } catch {
    return {
      success: false,
      message: 'Failed to delete theme',
    };
  }
}

// Level actions
export async function createLevel(
  _prevState: {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
  },
  formData: FormData
) {
  const user = await getAuthenticatedUser();

  const rawFormData = {
    name: formData.get('name'),
    description: formData.get('description'),
    difficulty: formData.get('difficulty'),
    themeId: formData.get('themeId'),
  };

  const validatedFields = levelSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  try {
    // Verify theme ownership
    const [theme] = await db
      .select()
      .from(themes)
      .where(eq(themes.id, validatedFields.data.themeId))
      .limit(1);

    if (!theme || theme.userId !== user.id) {
      return {
        success: false,
        message: 'Theme not found or access denied',
      };
    }

    const [newLevel] = await db
      .insert(levels)
      .values({
        name: validatedFields.data.name,
        description: validatedFields.data.description || '',
        difficulty: validatedFields.data.difficulty,
        themeId: validatedFields.data.themeId,
      })
      .returning();

    revalidatePath('/admin');
    return {
      success: true,
      data: newLevel,
      message: 'Level created successfully!',
    };
  } catch {
    return {
      success: false,
      message: 'Failed to create level',
    };
  }
}

export async function updateLevel(
  id: number,
  _prevState: {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
  },
  formData: FormData
) {
  const user = await getAuthenticatedUser();

  const rawFormData = {
    name: formData.get('name'),
    description: formData.get('description'),
    difficulty: formData.get('difficulty'),
    themeId: formData.get('themeId'),
  };

  const validatedFields = levelSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  try {
    // Verify ownership through theme
    const [levelWithTheme] = await db
      .select({
        level: levels,
        theme: themes,
      })
      .from(levels)
      .innerJoin(themes, eq(levels.themeId, themes.id))
      .where(eq(levels.id, id))
      .limit(1);

    if (!levelWithTheme || levelWithTheme.theme.userId !== user.id) {
      return {
        success: false,
        message: 'Level not found or access denied',
      };
    }

    // Verify new theme ownership if changing theme
    if (validatedFields.data.themeId !== levelWithTheme.level.themeId) {
      const [newTheme] = await db
        .select()
        .from(themes)
        .where(eq(themes.id, validatedFields.data.themeId))
        .limit(1);

      if (!newTheme || newTheme.userId !== user.id) {
        return {
          success: false,
          message: 'New theme not found or access denied',
        };
      }
    }

    const [updatedLevel] = await db
      .update(levels)
      .set({
        name: validatedFields.data.name,
        description: validatedFields.data.description || '',
        difficulty: validatedFields.data.difficulty,
        themeId: validatedFields.data.themeId,
      })
      .where(eq(levels.id, id))
      .returning();

    revalidatePath('/admin');
    return {
      success: true,
      data: updatedLevel,
      message: 'Level updated successfully!',
    };
  } catch {
    return {
      success: false,
      message: 'Failed to update level',
    };
  }
}

export async function deleteLevel(id: number) {
  const user = await getAuthenticatedUser();

  try {
    // Verify ownership through theme
    const [levelWithTheme] = await db
      .select({
        level: levels,
        theme: themes,
      })
      .from(levels)
      .innerJoin(themes, eq(levels.themeId, themes.id))
      .where(eq(levels.id, id))
      .limit(1);

    if (!levelWithTheme || levelWithTheme.theme.userId !== user.id) {
      return {
        success: false,
        message: 'Level not found or access denied',
      };
    }

    await db.delete(levels).where(eq(levels.id, id));

    revalidatePath('/admin');
    return {
      success: true,
      message: 'Level deleted successfully!',
    };
  } catch {
    return {
      success: false,
      message: 'Failed to delete level',
    };
  }
}

// Exercise actions
export async function createExercise(
  _prevState: {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
  },
  formData: FormData
) {
  const user = await getAuthenticatedUser();

  const optionsStr = formData.get('options') as string;
  const options = optionsStr
    ? optionsStr
        .split(',')
        .map((opt) => opt.trim())
        .filter(Boolean)
    : [];

  const rawFormData = {
    type: formData.get('type'),
    question: formData.get('question'),
    options,
    correctAnswer: formData.get('correctAnswer'),
    explanation: formData.get('explanation'),
    levelId: formData.get('levelId'),
  };

  const validatedFields = exerciseSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  try {
    // Verify level ownership through theme
    const [levelWithTheme] = await db
      .select({
        level: levels,
        theme: themes,
      })
      .from(levels)
      .innerJoin(themes, eq(levels.themeId, themes.id))
      .where(eq(levels.id, validatedFields.data.levelId))
      .limit(1);

    if (!levelWithTheme || levelWithTheme.theme.userId !== user.id) {
      return {
        success: false,
        message: 'Level not found or access denied',
      };
    }

    const [newExercise] = await db
      .insert(exercises)
      .values({
        type: validatedFields.data.type,
        question: validatedFields.data.question || '',
        options: validatedFields.data.options || [],
        correctAnswer: validatedFields.data.correctAnswer,
        explanation: validatedFields.data.explanation || '',
        levelId: validatedFields.data.levelId,
      })
      .returning();

    revalidatePath('/admin');
    return {
      success: true,
      data: newExercise,
      message: 'Exercise created successfully!',
    };
  } catch {
    return {
      success: false,
      message: 'Failed to create exercise',
    };
  }
}

export async function updateExercise(
  id: number,
  _prevState: {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
  },
  formData: FormData
) {
  const user = await getAuthenticatedUser();

  const optionsStr = formData.get('options') as string;
  const options = optionsStr
    ? optionsStr
        .split(',')
        .map((opt) => opt.trim())
        .filter(Boolean)
    : [];

  const rawFormData = {
    type: formData.get('type'),
    question: formData.get('question'),
    options,
    correctAnswer: formData.get('correctAnswer'),
    explanation: formData.get('explanation'),
    levelId: formData.get('levelId'),
  };

  const validatedFields = exerciseSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  try {
    // Verify ownership through theme
    const [exerciseWithLevelAndTheme] = await db
      .select({
        exercise: exercises,
        level: levels,
        theme: themes,
      })
      .from(exercises)
      .innerJoin(levels, eq(exercises.levelId, levels.id))
      .innerJoin(themes, eq(levels.themeId, themes.id))
      .where(eq(exercises.id, id))
      .limit(1);

    if (
      !exerciseWithLevelAndTheme ||
      exerciseWithLevelAndTheme.theme.userId !== user.id
    ) {
      return {
        success: false,
        message: 'Exercise not found or access denied',
      };
    }

    // Verify new level ownership if changing level
    if (
      validatedFields.data.levelId !==
      exerciseWithLevelAndTheme.exercise.levelId
    ) {
      const [levelWithTheme] = await db
        .select({
          level: levels,
          theme: themes,
        })
        .from(levels)
        .innerJoin(themes, eq(levels.themeId, themes.id))
        .where(eq(levels.id, validatedFields.data.levelId))
        .limit(1);

      if (!levelWithTheme || levelWithTheme.theme.userId !== user.id) {
        return {
          success: false,
          message: 'New level not found or access denied',
        };
      }
    }

    const [updatedExercise] = await db
      .update(exercises)
      .set({
        type: validatedFields.data.type,
        question: validatedFields.data.question || '',
        options: validatedFields.data.options || [],
        correctAnswer: validatedFields.data.correctAnswer,
        explanation: validatedFields.data.explanation || '',
        levelId: validatedFields.data.levelId,
      })
      .where(eq(exercises.id, id))
      .returning();

    revalidatePath('/admin');
    return {
      success: true,
      data: updatedExercise,
      message: 'Exercise updated successfully!',
    };
  } catch {
    return {
      success: false,
      message: 'Failed to update exercise',
    };
  }
}

export async function deleteExercise(id: number) {
  const user = await getAuthenticatedUser();

  try {
    // Verify ownership through theme
    const [exerciseWithLevelAndTheme] = await db
      .select({
        exercise: exercises,
        level: levels,
        theme: themes,
      })
      .from(exercises)
      .innerJoin(levels, eq(exercises.levelId, levels.id))
      .innerJoin(themes, eq(levels.themeId, themes.id))
      .where(eq(exercises.id, id))
      .limit(1);

    if (
      !exerciseWithLevelAndTheme ||
      exerciseWithLevelAndTheme.theme.userId !== user.id
    ) {
      return {
        success: false,
        message: 'Exercise not found or access denied',
      };
    }

    await db.delete(exercises).where(eq(exercises.id, id));

    revalidatePath('/admin');
    return {
      success: true,
      message: 'Exercise deleted successfully!',
    };
  } catch {
    return {
      success: false,
      message: 'Failed to delete exercise',
    };
  }
}
