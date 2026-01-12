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
      
      // Extraer query parameters
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const projectId = req.query.projectId as string | undefined;
      const status = req.query.status as string | undefined;
      const priority = req.query.priority as string | undefined;
      const assignedToId = req.query.assignedToId as string | undefined;
      const search = req.query.search as string | undefined;
      const dueDateFrom = req.query.dueDateFrom as string | undefined;
      const dueDateTo = req.query.dueDateTo as string | undefined;

      const result = await taskService.findAll(userId, userRole, {
        page,
        limit,
        projectId,
        status,
        priority,
        assignedToId,
        search,
        dueDateFrom,
        dueDateTo,
      });

      res.status(200).json({
        message: 'Tasks retrieved successfully',
        ...result,
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
