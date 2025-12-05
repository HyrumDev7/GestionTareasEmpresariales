import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

const taskService = new TaskService();

export class TaskController {
  async create(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const task = await taskService.create(req.body, userId, userRole);

      res.status(201).json({
        message: 'Task created successfully',
        data: task,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 403;
      res.status(statusCode).json({
        error: 'Failed to create task',
        message: error.message,
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { projectId, status, priority, assignedToId } = req.query;

      const tasks = await taskService.findAll(userId, userRole, {
        projectId: projectId as string,
        status: status as string,
        priority: priority as string,
        assignedToId: assignedToId as string,
      });

      res.status(200).json({
        message: 'Tasks retrieved successfully',
        data: tasks,
        count: tasks.length,
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to retrieve tasks',
        message: error.message,
      });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const task = await taskService.findById(id, userId, userRole);

      res.status(200).json({
        message: 'Task retrieved successfully',
        data: task,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 403;
      res.status(statusCode).json({
        error: 'Failed to retrieve task',
        message: error.message,
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const task = await taskService.update(id, req.body, userId, userRole);

      res.status(200).json({
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 403;
      res.status(statusCode).json({
        error: 'Failed to update task',
        message: error.message,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const result = await taskService.delete(id, userId, userRole);

      res.status(200).json(result);
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 403;
      res.status(statusCode).json({
        error: 'Failed to delete task',
        message: error.message,
      });
    }
  }
}
