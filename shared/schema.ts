import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  progress: integer("progress").default(0).notNull(),
  status: text("status").default("todo").notNull(), // todo, in-progress, done
  description: text("description"),
  assignee: text("assignee"),
  isOverdue: boolean("is_overdue").default(false),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ 
  id: true,
  isOverdue: true 
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
