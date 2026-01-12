import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';

const projectService = new ProjectService();

export class ProjectController {
  async create(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const project = await projectService.create(req.body, userId);

      res.status(201).json({
        message: 'Project created successfully',
        data: project,
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to create project',
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
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await projectService.findAll(userId, userRole, {
        page,
        limit,
        status,
        search,
      });

      res.status(200).json({
        message: 'Projects retrieved successfully',
        ...result,
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to retrieve projects',
        message: error.message,
      });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const project = await projectService.findById(id, userId, userRole);

      res.status(200).json({
        message: 'Project retrieved successfully',
        data: project,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 403;
      res.status(statusCode).json({
        error: 'Failed to retrieve project',
        message: error.message,
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const project = await projectService.update(id, req.body, userId, userRole);

      res.status(200).json({
        message: 'Project updated successfully',
        data: project,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 403;
      res.status(statusCode).json({
        error: 'Failed to update project',
        message: error.message,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const result = await projectService.delete(id, userId, userRole);

      res.status(200).json(result);
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 403;
      res.status(statusCode).json({
        error: 'Failed to delete project',
        message: error.message,
      });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const stats = await projectService.getStats(id, userId, userRole);

      res.status(200).json({
        message: 'Project stats retrieved successfully',
        data: stats,
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to retrieve stats',
        message: error.message,
      });
    }
  }
}
