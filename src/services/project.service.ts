import { prisma } from '../config/database';
import { CreateProjectDTO, UpdateProjectDTO } from '../dtos/project.dto';

export class ProjectService {
  /**
   * Crear nuevo proyecto
   */
  async create(data: CreateProjectDTO, ownerId: string) {
    const project = await prisma.project.create({
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

  /**
   * Listar proyectos con paginación y filtros
   * - ADMIN ve todos
   * - USER ve solo los suyos
   */
  async findAll(
    userId: string,
    userRole: string,
    options?: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    }
  ) {
    const page = options?.page && options.page > 0 ? options.page : 1;
    const limit = options?.limit && options.limit > 0 && options.limit <= 100 ? options.limit : 10;
    const skip = (page - 1) * limit;

    // Construir filtros base
    const where: any = userRole === 'ADMIN' ? {} : { ownerId: userId };

    // Filtro por status
    if (options?.status) {
      where.status = options.status;
    }

    // Filtro de búsqueda (nombre o descripción)
    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    // Obtener total para paginación
    const total = await prisma.project.count({ where });

    // Obtener proyectos
    const projects = await prisma.project.findMany({
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
      skip,
      take: limit,
    });

    return {
      data: projects,
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

  /**
   * Obtener proyecto por ID
   */
  async findById(projectId: string, userId: string, userRole: string) {
    const project = await prisma.project.findUnique({
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

    // Verificar permisos
    if (userRole !== 'ADMIN' && project.ownerId !== userId) {
      throw new Error('Unauthorized to view this project');
    }

    return project;
  }

  /**
   * Actualizar proyecto
   */
  async update(projectId: string, data: UpdateProjectDTO, userId: string, userRole: string) {
    // Verificar que el proyecto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Verificar permisos
    if (userRole !== 'ADMIN' && project.ownerId !== userId) {
      throw new Error('Unauthorized to update this project');
    }

    // Actualizar
    const updatedProject = await prisma.project.update({
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

  /**
   * Eliminar proyecto
   */
  async delete(projectId: string, userId: string, userRole: string) {
    // Verificar que el proyecto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Verificar permisos
    if (userRole !== 'ADMIN' && project.ownerId !== userId) {
      throw new Error('Unauthorized to delete this project');
    }

    // Eliminar (las tareas se eliminan automáticamente por onDelete: Cascade)
    await prisma.project.delete({
      where: { id: projectId },
    });

    return { message: 'Project deleted successfully' };
  }

  /**
   * Obtener estadísticas del proyecto con métricas avanzadas
   */
  async getStats(projectId: string, userId: string, userRole: string) {
    // Verificar acceso
    await this.findById(projectId, userId, userRole);

    // Estadísticas por status
    const statsByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: {
        projectId,
      },
      _count: true,
    });

    // Estadísticas por prioridad
    const statsByPriority = await prisma.task.groupBy({
      by: ['priority'],
      where: {
        projectId,
      },
      _count: true,
    });

    // Totales
    const totalTasks = await prisma.task.count({
      where: { projectId },
    });

    const completedTasks = await prisma.task.count({
      where: {
        projectId,
        status: 'DONE',
      },
    });

    const inProgressTasks = await prisma.task.count({
      where: {
        projectId,
        status: 'IN_PROGRESS',
      },
    });

    // Tareas vencidas
    const overdueTasks = await prisma.task.count({
      where: {
        projectId,
        dueDate: {
          lt: new Date(),
        },
        status: {
          not: 'DONE',
        },
      },
    });

    // Tareas urgentes
    const urgentTasks = await prisma.task.count({
      where: {
        projectId,
        priority: 'URGENT',
        status: {
          not: 'DONE',
        },
      },
    });

    // Porcentaje de completitud
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      urgentTasks,
      completionPercentage,
      byStatus: statsByStatus.reduce(
        (acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        },
        {} as Record<string, number>
      ),
      byPriority: statsByPriority.reduce(
        (acc, stat) => {
          acc[stat.priority] = stat._count;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }
}
