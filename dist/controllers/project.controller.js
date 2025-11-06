"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const project_service_1 = require("../services/project.service");
const projectService = new project_service_1.ProjectService();
class ProjectController {
    async create(req, res) {
        try {
            const userId = req.user.userId;
            const project = await projectService.create(req.body, userId);
            res.status(201).json({
                message: 'Project created successfully',
                data: project,
            });
        }
        catch (error) {
            res.status(400).json({
                error: 'Failed to create project',
                message: error.message,
            });
        }
    }
    async findAll(req, res) {
        try {
            const userId = req.user.userId;
            const userRole = req.user.role;
            const projects = await projectService.findAll(userId, userRole);
            res.status(200).json({
                message: 'Projects retrieved successfully',
                data: projects,
                count: projects.length,
            });
        }
        catch (error) {
            res.status(400).json({
                error: 'Failed to retrieve projects',
                message: error.message,
            });
        }
    }
    async findById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const userRole = req.user.role;
            const project = await projectService.findById(id, userId, userRole);
            res.status(200).json({
                message: 'Project retrieved successfully',
                data: project,
            });
        }
        catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 403;
            res.status(statusCode).json({
                error: 'Failed to retrieve project',
                message: error.message,
            });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const userRole = req.user.role;
            const project = await projectService.update(id, req.body, userId, userRole);
            res.status(200).json({
                message: 'Project updated successfully',
                data: project,
            });
        }
        catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 403;
            res.status(statusCode).json({
                error: 'Failed to update project',
                message: error.message,
            });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const userRole = req.user.role;
            const result = await projectService.delete(id, userId, userRole);
            res.status(200).json(result);
        }
        catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 403;
            res.status(statusCode).json({
                error: 'Failed to delete project',
                message: error.message,
            });
        }
    }
    async getStats(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const userRole = req.user.role;
            const stats = await projectService.getStats(id, userId, userRole);
            res.status(200).json({
                message: 'Project stats retrieved successfully',
                data: stats,
            });
        }
        catch (error) {
            res.status(400).json({
                error: 'Failed to retrieve stats',
                message: error.message,
            });
        }
    }
}
exports.ProjectController = ProjectController;
//# sourceMappingURL=project.controller.js.map