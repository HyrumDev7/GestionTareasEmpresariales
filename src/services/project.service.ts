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
   * Listar proyectos
   * - ADMIN ve todos
   * - USER ve solo los suyos
   */
  async findAll(userId: string, userRole: string) {
    const where = userRole === 'ADMIN' ? {} : { ownerId: userId };

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
    });

    return projects;
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
   * Obtener estadísticas del proyecto
   */
  async getStats(projectId: string, userId: string, userRole: string) {
    // Verificar acceso
    await this.findById(projectId, userId, userRole);

    const stats = await prisma.task.groupBy({
      by: ['status'],
      where: {
        projectId,
      },
      _count: true,
    });

    const totalTasks = await prisma.task.count({
      where: { projectId },
    });

    return {
      totalTasks,
      byStatus: stats.reduce(
        (acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }
}
