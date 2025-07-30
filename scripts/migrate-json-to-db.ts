#!/usr/bin/env bun

import { eq } from 'drizzle-orm';
import levelsData from '../src/data/levels.json' with { type: 'json' };
import { db } from '../src/db';
import { exercises, levels, themes, user } from '../src/db/schema';

interface JsonExercise {
  id: string;
  type: string;
  question?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface JsonLevel {
  id: string;
  name: string;
  difficulty: number;
  description: string;
  exercises: JsonExercise[];
}

interface JsonTheme {
  id: string;
  name: string;
  description: string;
  levels: JsonLevel[];
}

interface JsonData {
  themes: JsonTheme[];
}

async function migrateData() {
  console.log('🚀 Starting migration from JSON to database...');

  try {
    const jsonData = levelsData as JsonData;

    // Create a default user first if it doesn't exist
    const defaultUser = await db
      .select()
      .from(user)
      .where(eq(user.email, 'admin@skyromat.sk'))
      .limit(1);

    let defaultUserId: string;

    if (defaultUser.length === 0) {
      const [newUser] = await db
        .insert(user)
        .values({
          id: 'admin-user',
          name: 'Admin User',
          email: 'admin@skyromat.sk',
          emailVerified: true,
        })
        .returning();
      defaultUserId = newUser.id;
      console.log('✨ Created default admin user');
    } else {
      defaultUserId = defaultUser[0].id;
      console.log('📋 Using existing admin user');
    }

    for (const theme of jsonData.themes) {
      console.log(`📚 Migrating theme: ${theme.name}`);

      // Insert theme
      const [insertedTheme] = await db
        .insert(themes)
        .values({
          name: theme.name,
          description: theme.description || '',
          userId: defaultUserId,
        })
        .returning();

      for (const level of theme.levels) {
        console.log(`  📖 Migrating level: ${level.name}`);

        // Insert level
        const [insertedLevel] = await db
          .insert(levels)
          .values({
            name: level.name,
            description: level.description || '',
            difficulty: level.difficulty,
            themeId: insertedTheme.id,
          })
          .returning();

        for (const exercise of level.exercises) {
          console.log(`    ✏️  Migrating exercise: ${exercise.id}`);

          // Insert exercise
          await db.insert(exercises).values({
            type: exercise.type,
            question: exercise.question || '',
            options: exercise.options,
            correctAnswer: exercise.correctAnswer,
            explanation: exercise.explanation || '',
            levelId: insertedLevel.id,
          });
        }
      }
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();
