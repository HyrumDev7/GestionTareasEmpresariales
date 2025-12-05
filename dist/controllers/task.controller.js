"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_service_1 = require("../services/task.service");
const taskService = new task_service_1.TaskService();
class TaskController {
    async create(req, res) {
        try {
            const userId = req.user.userId;
            const userRole = req.user.role;
            const task = await taskService.create(req.body, userId, userRole);
            res.status(201).json({
                message: 'Task created successfully',
                data: task,
            });
        }
        catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 403;
            res.status(statusCode).json({
                error: 'Failed to create task',
                message: error.message,
            });
        }
    }
    async findAll(req, res) {
        try {
            const userId = req.user.userId;
            const userRole = req.user.role;
            const { projectId, status, priority, assignedToId } = req.query;
            const tasks = await taskService.findAll(userId, userRole, {
                projectId: projectId,
                status: status,
                priority: priority,
                assignedToId: assignedToId,
            });
            res.status(200).json({
                message: 'Tasks retrieved successfully',
                data: tasks,
                count: tasks.length,
            });
        }
        catch (error) {
            res.status(400).json({
                error: 'Failed to retrieve tasks',
                message: error.message,
            });
        }
    }
    async findById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const userRole = req.user.role;
            const task = await taskService.findById(id, userId, userRole);
            res.status(200).json({
                message: 'Task retrieved successfully',
                data: task,
            });
        }
        catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 403;
            res.status(statusCode).json({
                error: 'Failed to retrieve task',
                message: error.message,
            });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const userRole = req.user.role;
            const task = await taskService.update(id, req.body, userId, userRole);
            res.status(200).json({
                message: 'Task updated successfully',
                data: task,
            });
        }
        catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 403;
            res.status(statusCode).json({
                error: 'Failed to update task',
                message: error.message,
            });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const userRole = req.user.role;
            const result = await taskService.delete(id, userId, userRole);
            res.status(200).json(result);
        }
        catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 403;
            res.status(statusCode).json({
                error: 'Failed to delete task',
                message: error.message,
            });
        }
    }
}
exports.TaskController = TaskController;
//# sourceMappingURL=task.controller.js.map