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
    async findAll(userId, userRole, options) {
        const page = options?.page && options.page > 0 ? options.page : 1;
        const limit = options?.limit && options.limit > 0 && options.limit <= 100 ? options.limit : 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (userRole !== 'ADMIN') {
            where.OR = [{ project: { ownerId: userId } }, { assignedToId: userId }];
        }
        if (options?.projectId)
            where.projectId = options.projectId;
        if (options?.status)
            where.status = options.status;
        if (options?.priority)
            where.priority = options.priority;
        if (options?.assignedToId)
            where.assignedToId = options.assignedToId;
        if (options?.search) {
            where.OR = [
                ...(where.OR || []),
                { title: { contains: options.search, mode: 'insensitive' } },
                { description: { contains: options.search, mode: 'insensitive' } },
            ];
        }
        if (options?.dueDateFrom || options?.dueDateTo) {
            where.dueDate = {};
            if (options.dueDateFrom) {
                where.dueDate.gte = new Date(options.dueDateFrom);
            }
            if (options.dueDateTo) {
                where.dueDate.lte = new Date(options.dueDateTo);
            }
        }
        const total = await database_1.prisma.task.count({ where });
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
            skip,
            take: limit,
        });
        return {
            data: tasks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
            },
        };
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