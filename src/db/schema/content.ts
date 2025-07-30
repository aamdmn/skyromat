import {
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

export const themes = pgTable('themes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .notNull(),
});

export const levels = pgTable('levels', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description'),
  difficulty: integer('difficulty').notNull(),
  themeId: integer('theme_id')
    .notNull()
    .references(() => themes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .notNull(),
});

export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }).notNull(),
  question: text('question'),
  options: json('options').$type<string[]>().default([]),
  correctAnswer: text('correct_answer').notNull(),
  explanation: text('explanation'),
  levelId: integer('level_id')
    .notNull()
    .references(() => levels.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .notNull(),
});

export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  levelId: integer('level_id')
    .notNull()
    .references(() => levels.id, { onDelete: 'cascade' }),
  completedAt: timestamp('completed_at')
    .$defaultFn(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
});
