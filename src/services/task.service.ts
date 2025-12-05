import { prisma } from '../config/database';
import { CreateTaskDTO, UpdateTaskDTO } from '../dtos/task.dto';

export class TaskService {
  /**
   * Crear nueva tarea
   */
  async create(data: CreateTaskDTO, userId: string, userRole: string) {
    // Verificar que el proyecto existe y el usuario tiene acceso
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Verificar permisos
    if (userRole !== 'ADMIN' && project.ownerId !== userId) {
      throw new Error('Unauthorized to create tasks in this project');
    }

    // Crear tarea
    const task = await prisma.task.create({
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

  /**
   * Listar tareas con filtros
   */
  async findAll(
    userId: string,
    userRole: string,
    filters?: {
      projectId?: string;
      status?: string;
      priority?: string;
      assignedToId?: string;
    }
  ) {
    const where: any = {};

    // Si no es ADMIN, solo ver tareas de sus proyectos o asignadas
    if (userRole !== 'ADMIN') {
      where.OR = [{ project: { ownerId: userId } }, { assignedToId: userId }];
    }

    // Aplicar filtros
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.assignedToId) where.assignedToId = filters.assignedToId;

    const tasks = await prisma.task.findMany({
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

  /**
   * Obtener tarea por ID
   */
  async findById(taskId: string, userId: string, userRole: string) {
    const task = await prisma.task.findUnique({
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

    // Verificar permisos
    const hasAccess =
      userRole === 'ADMIN' || task.project.ownerId === userId || task.assignedToId === userId;

    if (!hasAccess) {
      throw new Error('Unauthorized to view this task');
    }

    return task;
  }

  /**
   * Actualizar tarea
   */
  async update(taskId: string, data: UpdateTaskDTO, userId: string, userRole: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Verificar permisos
    const canEdit =
      userRole === 'ADMIN' || task.project.ownerId === userId || task.assignedToId === userId;

    if (!canEdit) {
      throw new Error('Unauthorized to update this task');
    }

    const updatedTask = await prisma.task.update({
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

  /**
   * Eliminar tarea
   */
  async delete(taskId: string, userId: string, userRole: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Solo ADMIN o owner del proyecto pueden eliminar
    const canDelete = userRole === 'ADMIN' || task.project.ownerId === userId;

    if (!canDelete) {
      throw new Error('Unauthorized to delete this task');
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return { message: 'Task deleted successfully' };
  }
}
