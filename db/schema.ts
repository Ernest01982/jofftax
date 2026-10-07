import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const preparations = sqliteTable('preparations', {
  id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),assessmentYear:integer('assessment_year').notNull(),schemaVersion:integer('schema_version').notNull(),rulesVersion:text('rules_version').notNull(),answersJson:text('answers_json').notNull(),checklistJson:text('checklist_json').notNull(),revision:integer('revision').notNull(),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
},t=>[uniqueIndex('preparations_owner_year').on(t.ownerId,t.assessmentYear)]);
