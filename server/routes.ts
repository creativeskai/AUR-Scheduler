import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.tasks.list.path, async (req, res) => {
    const tasks = await storage.getTasks();
    
    // Check overdue status on list to ensure isOverdue flag is up to date (optional, but good for UI)
    const now = new Date();
    const tasksWithOverdue = tasks.map(t => ({
      ...t,
      isOverdue: t.endDate < now && t.status !== 'done'
    }));
    
    res.json(tasksWithOverdue);
  });

  app.get(api.tasks.get.path, async (req, res) => {
    const task = await storage.getTask(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    try {
      // Coerce dates from strings if necessary (Zod handles Date input, but JSON comes as string)
      // Actually standard Zod date schema expects Date object or coercible string
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(input);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.tasks.update.path, async (req, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const task = await storage.updateTask(Number(req.params.id), input);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.tasks.delete.path, async (req, res) => {
    await storage.deleteTask(Number(req.params.id));
    res.status(204).send();
  });

  app.post(api.tasks.checkOverdue.path, async (req, res) => {
    const overdueTasks = await storage.getOverdueTasks();
    
    if (overdueTasks.length > 0) {
      console.log(`Found ${overdueTasks.length} overdue tasks:`);
      overdueTasks.forEach(t => {
        console.log(`  - ${t.name} (due: ${t.endDate})`);
      });
      
      // In a real app, you would send an email here using your preferred email service
      // For now, we just log the overdue tasks
      return res.json({ 
        count: overdueTasks.length, 
        message: `Found ${overdueTasks.length} overdue tasks. Check server logs for details.` 
      });
    }
    
    res.json({ count: 0, message: 'No overdue tasks found.' });
  });

  // Seed data if empty
  const existing = await storage.getTasks();
  if (existing.length === 0) {
    console.log("Seeding database...");
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    
    await storage.createTask({
      name: "Project Kickoff",
      startDate: new Date(now.getTime() - 2 * day),
      endDate: new Date(now.getTime() - 1 * day),
      progress: 100,
      status: "done",
      assignee: "Alice",
      description: "Initial meeting with stakeholders"
    });
    
    await storage.createTask({
      name: "Design Phase",
      startDate: now,
      endDate: new Date(now.getTime() + 5 * day),
      progress: 30,
      status: "in-progress",
      assignee: "Bob",
      description: "Create UI/UX mockups"
    });
    
    await storage.createTask({
      name: "Backend Setup",
      startDate: new Date(now.getTime() + 1 * day),
      endDate: new Date(now.getTime() + 7 * day),
      progress: 10,
      status: "todo",
      assignee: "Charlie",
      description: "Setup DB and API"
    });

    // An overdue task
    await storage.createTask({
      name: "Legacy Migration",
      startDate: new Date(now.getTime() - 10 * day),
      endDate: new Date(now.getTime() - 2 * day),
      progress: 50,
      status: "in-progress",
      assignee: "Dave",
      description: "Migrate old data"
    });
  }

  return httpServer;
}
