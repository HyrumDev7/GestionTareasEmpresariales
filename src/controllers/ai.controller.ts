import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';

const aiService = new AIService();

export class AIController {
  /**
   * Genera tarea desde texto natural
   */
  async generateTask(req: Request, res: Response) {
    try {
      const { userInput, projectId } = req.body;

      if (!userInput) {
        return res.status(400).json({
          error: 'userInput is required',
          message: 'Please provide text to generate a task',
        });
      }

      const taskData = await aiService.generateTaskFromText(userInput, projectId);

      res.status(200).json({
        message: 'Task generated successfully by AI',
        data: taskData,
        usage: 'You can now create this task using POST /api/v1/tasks',
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to generate task',
        message: error.message,
      });
    }
  }

  /**
   * Sugiere tareas para un proyecto
   */
  async suggestTasks(req: Request, res: Response) {
    try {
      const { projectDescription, count } = req.body;

      if (!projectDescription) {
        return res.status(400).json({
          error: 'projectDescription is required',
          message: 'Please provide a project description',
        });
      }

      const taskCount = count || 5;
      const suggestions = await aiService.suggestTasksForProject(projectDescription, taskCount);

      res.status(200).json({
        message: `Generated ${suggestions.length} task suggestions`,
        data: suggestions,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to suggest tasks',
        message: error.message,
      });
    }
  }

  /**
   * Analiza input (útil para debugging)
   */
  async analyzeInput(req: Request, res: Response) {
    try {
      const { userInput } = req.body;

      if (!userInput) {
        return res.status(400).json({
          error: 'userInput is required',
        });
      }

      const analysis = await aiService.analyzeInput(userInput);

      res.status(200).json({
        message: 'Input analyzed',
        data: { analysis },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Analysis failed',
        message: error.message,
      });
    }
  }
}
