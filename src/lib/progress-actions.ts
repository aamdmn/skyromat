'use server';

import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { db } from '@/db';
import { userProgress } from '@/db/schema';
import { auth } from '@/lib/auth';

// Auth helper
async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  return session.user;
}

export async function completeLevel(levelId: number) {
  try {
    const user = await getAuthenticatedUser();

    // Check if the level is already completed by this user
    const existing = await db
      .select()
      .from(userProgress)
      .where(
        and(eq(userProgress.userId, user.id), eq(userProgress.levelId, levelId))
      )
      .limit(1);

    if (existing.length > 0) {
      // Level already completed
      return {
        success: true,
        message: 'Level already completed',
        alreadyCompleted: true,
      };
    }

    // Mark level as completed
    await db.insert(userProgress).values({
      userId: user.id,
      levelId,
    });

    return {
      success: true,
      message: 'Level completed successfully',
      alreadyCompleted: false,
    };
  } catch (error) {
    console.error('Error completing level:', error);
    return {
      success: false,
      message: 'Failed to save progress',
      alreadyCompleted: false,
    };
  }
}

export async function getUserProgress(userId?: string) {
  try {
    const user = userId ? { id: userId } : await getAuthenticatedUser();

    const progress = await db
      .select({
        levelId: userProgress.levelId,
        completedAt: userProgress.completedAt,
      })
      .from(userProgress)
      .where(eq(userProgress.userId, user.id));

    return {
      success: true,
      data: progress,
    };
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return {
      success: false,
      data: [],
    };
  }
}

export async function isLevelCompleted(levelId: number, userId?: string) {
  try {
    const user = userId ? { id: userId } : await getAuthenticatedUser();

    const result = await db
      .select()
      .from(userProgress)
      .where(
        and(eq(userProgress.userId, user.id), eq(userProgress.levelId, levelId))
      )
      .limit(1);

    return {
      success: true,
      completed: result.length > 0,
    };
  } catch (error) {
    console.error('Error checking level completion:', error);
    return {
      success: false,
      completed: false,
    };
  }
}
