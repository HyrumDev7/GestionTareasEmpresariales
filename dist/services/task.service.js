"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const database_1 = require("../config/database");
class TaskService {
    async create(data, userId, userRole) {
        const project = await database_1.prisma.project.findUnique({
            where: { id: data.projectId },
        });
        if (!project) {
            throw new Error('Project not found');
        }
        if (userRole !== 'ADMIN' && project.ownerId !== userId) {
            throw new Error('Unauthorized to create tasks in this project');
        }
        const task = await database_1.prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                projectId: data.projectId,
                assignedToId: data.assignedToId,
                priority: data.priority || 'MEDIUM',
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return task;
    }
    async findAll(userId, userRole, filters) {
        const where = {};
        if (userRole !== 'ADMIN') {
            where.OR = [{ project: { ownerId: userId } }, { assignedToId: userId }];
        }
        if (filters?.projectId)
            where.projectId = filters.projectId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.priority)
            where.priority = filters.priority;
        if (filters?.assignedToId)
            where.assignedToId = filters.assignedToId;
        const tasks = await database_1.prisma.task.findMany({
            where,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        });
        return tasks;
    }
    async findById(taskId, userId, userRole) {
        const task = await database_1.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!task) {
            throw new Error('Task not found');
        }
        const hasAccess = userRole === 'ADMIN' || task.project.ownerId === userId || task.assignedToId === userId;
        if (!hasAccess) {
            throw new Error('Unauthorized to view this task');
        }
        return task;
    }
    async update(taskId, data, userId, userRole) {
        const task = await database_1.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true },
        });
        if (!task) {
            throw new Error('Task not found');
        }
        const canEdit = userRole === 'ADMIN' || task.project.ownerId === userId || task.assignedToId === userId;
        if (!canEdit) {
            throw new Error('Unauthorized to update this task');
        }
        const updatedTask = await database_1.prisma.task.update({
            where: { id: taskId },
            data: {
                title: data.title,
                description: data.description,
                status: data.status,
                priority: data.priority,
                assignedToId: data.assignedToId,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return updatedTask;
    }
    async delete(taskId, userId, userRole) {
        const task = await database_1.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true },
        });
        if (!task) {
            throw new Error('Task not found');
        }
        const canDelete = userRole === 'ADMIN' || task.project.ownerId === userId;
        if (!canDelete) {
            throw new Error('Unauthorized to delete this task');
        }
        await database_1.prisma.task.delete({
            where: { id: taskId },
        });
        return { message: 'Task deleted successfully' };
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=task.service.js.map