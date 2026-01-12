import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';

const aiService = new AIService();

export class AIController {
  async generateTask(req: Request, res: Response): Promise<void> {
    try {
      const { userInput, projectId } = req.body;

      if (!userInput) {
        res.status(400).json({
          error: 'userInput is required',
          message: 'Please provide text to generate a task',
        });
        return;
      }

      const taskData = await aiService.generateTaskFromText(userInput, projectId);

      res.status(200).json({
        message: 'Task generated successfully by AI',
        data: taskData,
        usage: 'You can now create this task using POST /api/v1/tasks',
      });
    } catch (error: any) {
      // Detectar tipos específicos de errores para códigos HTTP apropiados
      let statusCode = 500;
      
      if (error.message?.includes('API key') || error.message?.includes('invalid') || error.message?.includes('authentication')) {
        statusCode = 401;
      } else if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
        statusCode = 429;
      } else if (error.message?.includes('temporarily unavailable')) {
        statusCode = 503;
      }

      res.status(statusCode).json({
        error: 'Failed to generate task',
        message: error.message,
      });
    }
  }

  async suggestTasks(req: Request, res: Response): Promise<void> {
    try {
      const { projectDescription, count } = req.body;

      if (!projectDescription) {
        res.status(400).json({
          error: 'projectDescription is required',
          message: 'Please provide a project description',
        });
        return;
      }

      const taskCount = count || 5;
      const suggestions = await aiService.suggestTasksForProject(projectDescription, taskCount);

      res.status(200).json({
        message: `Generated ${suggestions.length} task suggestions`,
        data: suggestions,
      });
    } catch (error: any) {
      // Detectar tipos específicos de errores para códigos HTTP apropiados
      let statusCode = 500;
      
      if (error.message?.includes('API key') || error.message?.includes('invalid') || error.message?.includes('authentication')) {
        statusCode = 401;
      } else if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
        statusCode = 429;
      } else if (error.message?.includes('temporarily unavailable')) {
        statusCode = 503;
      }

      res.status(statusCode).json({
        error: 'Failed to suggest tasks',
        message: error.message,
      });
    }
  }

  async analyzeInput(req: Request, res: Response): Promise<void> {
    try {
      const { userInput } = req.body;

      if (!userInput) {
        res.status(400).json({
          error: 'userInput is required',
        });
        return;
      }

      const analysis = await aiService.analyzeInput(userInput);

      res.status(200).json({
        message: 'Input analyzed',
        data: { analysis },
      });
    } catch (error: any) {
      // Detectar tipos específicos de errores para códigos HTTP apropiados
      let statusCode = 500;
      
      if (error.message?.includes('API key') || error.message?.includes('invalid') || error.message?.includes('authentication')) {
        statusCode = 401;
      } else if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
        statusCode = 429;
      } else if (error.message?.includes('temporarily unavailable')) {
        statusCode = 503;
      }

      res.status(statusCode).json({
        error: 'Analysis failed',
        message: error.message,
      });
    }
  }
}
