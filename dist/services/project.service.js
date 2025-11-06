"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const database_1 = require("../config/database");
class ProjectService {
    async create(data, ownerId) {
        const project = await database_1.prisma.project.create({
            data: {
                name: data.name,
                description: data.description,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                ownerId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
        return project;
    }
    async findAll(userId, userRole) {
        const where = userRole === 'ADMIN' ? {} : { ownerId: userId };
        const projects = await database_1.prisma.project.findMany({
            where,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                tasks: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return projects;
    }
    async findById(projectId, userId, userRole) {
        const project = await database_1.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                tasks: {
                    include: {
                        assignedTo: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
        if (!project) {
            throw new Error('Project not found');
        }
        if (userRole !== 'ADMIN' && project.ownerId !== userId) {
            throw new Error('Unauthorized to view this project');
        }
        return project;
    }
    async update(projectId, data, userId, userRole) {
        const project = await database_1.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new Error('Project not found');
        }
        if (userRole !== 'ADMIN' && project.ownerId !== userId) {
            throw new Error('Unauthorized to update this project');
        }
        const updatedProject = await database_1.prisma.project.update({
            where: { id: projectId },
            data: {
                name: data.name,
                description: data.description,
                status: data.status,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                tasks: true,
            },
        });
        return updatedProject;
    }
    async delete(projectId, userId, userRole) {
        const project = await database_1.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new Error('Project not found');
        }
        if (userRole !== 'ADMIN' && project.ownerId !== userId) {
            throw new Error('Unauthorized to delete this project');
        }
        await database_1.prisma.project.delete({
            where: { id: projectId },
        });
        return { message: 'Project deleted successfully' };
    }
    async getStats(projectId, userId, userRole) {
        await this.findById(projectId, userId, userRole);
        const stats = await database_1.prisma.task.groupBy({
            by: ['status'],
            where: {
                projectId,
            },
            _count: true,
        });
        const totalTasks = await database_1.prisma.task.count({
            where: { projectId },
        });
        return {
            totalTasks,
            byStatus: stats.reduce((acc, stat) => {
                acc[stat.status] = stat._count;
                return acc;
            }, {}),
        };
    }
}
exports.ProjectService = ProjectService;
//# sourceMappingURL=project.service.js.map