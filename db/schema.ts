import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  onboarded: boolean('onboarded').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const goalsTable = pgTable('goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  goal: text('goal').notNull(), // 10-200 chars
  reminderCadence: text('reminder_cadence'), // 'daily' | 'weekly' | null
  lastCheckInAt: timestamp('last_check_in_at'),
  streak: integer('streak').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const accountabilityPartnersTable = pgTable('accountability_partners', {
  id: serial('id').primaryKey(),
  goalId: integer('goal_id').notNull().references(() => goalsTable.id, { onDelete: 'cascade' }),
  email: text('email'),
  phone: text('phone'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  goals: many(goalsTable),
}));

export const goalsRelations = relations(goalsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [goalsTable.userId],
    references: [usersTable.id],
  }),
  accountabilityPartners: many(accountabilityPartnersTable),
}));

export const accountabilityPartnersRelations = relations(accountabilityPartnersTable, ({ one }) => ({
  goal: one(goalsTable, {
    fields: [accountabilityPartnersTable.goalId],
    references: [goalsTable.id],
  }),
}));

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertGoal = typeof goalsTable.$inferInsert;
export type SelectGoal = typeof goalsTable.$inferSelect;
export type InsertAccountabilityPartner = typeof accountabilityPartnersTable.$inferInsert;
export type SelectAccountabilityPartner = typeof accountabilityPartnersTable.$inferSelect;
