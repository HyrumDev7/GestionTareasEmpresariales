"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const ai_service_1 = require("../services/ai.service");
const aiService = new ai_service_1.AIService();
class AIController {
    async generateTask(req, res) {
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
        }
        catch (error) {
            res.status(500).json({
                error: 'Failed to generate task',
                message: error.message,
            });
        }
    }
    async suggestTasks(req, res) {
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
        }
        catch (error) {
            res.status(500).json({
                error: 'Failed to suggest tasks',
                message: error.message,
            });
        }
    }
    async analyzeInput(req, res) {
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
        }
        catch (error) {
            res.status(500).json({
                error: 'Analysis failed',
                message: error.message,
            });
        }
    }
}
exports.AIController = AIController;
//# sourceMappingURL=ai.controller.js.map