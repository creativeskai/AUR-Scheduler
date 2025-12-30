import { db } from "./db";
import { tasks, type Task, type InsertTask } from "@shared/schema";
import { eq, lt, and, not } from "drizzle-orm";

export interface IStorage {
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  getOverdueTasks(): Promise<Task[]>;
}

export class DatabaseStorage implements IStorage {
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(tasks.startDate);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    return await db.select().from(tasks).where(
      and(
        lt(tasks.endDate, now),
        not(eq(tasks.status, "done"))
      )
    );
  }
}

export const storage = new DatabaseStorage();
