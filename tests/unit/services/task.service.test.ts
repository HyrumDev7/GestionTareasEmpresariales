import { TaskService } from '../../../src/services/task.service';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
  },
}));

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(() => {
    taskService = new TaskService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear una tarea exitosamente', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        projectId: 'project-id',
        priority: 'MEDIUM' as const,
      };

      const project = {
        id: 'project-id',
        ownerId: 'user-id',
      };

      const createdTask = {
        id: 'task-id',
        ...taskData,
        status: 'TODO',
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedToId: null,
        dueDate: null,
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
      (prisma.task.create as jest.Mock).mockResolvedValue(createdTask);

      const result = await taskService.create(taskData, 'user-id', 'ADMIN');

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: taskData.projectId },
      });
      expect(prisma.task.create).toHaveBeenCalled();
      expect(result.id).toBe('task-id');
    });

    it('debería lanzar error si el proyecto no existe', async () => {
      const taskData = {
        title: 'Test Task',
        projectId: 'non-existent-project',
        priority: 'MEDIUM' as const,
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        taskService.create(taskData, 'user-id', 'USER')
      ).rejects.toThrow('Project not found');
    });

    it('debería lanzar error si el usuario no tiene permisos', async () => {
      const taskData = {
        title: 'Test Task',
        projectId: 'project-id',
        priority: 'MEDIUM' as const,
      };

      const project = {
        id: 'project-id',
        ownerId: 'other-user-id',
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);

      await expect(
        taskService.create(taskData, 'user-id', 'USER')
      ).rejects.toThrow('Unauthorized to create tasks in this project');
    });
  });

  describe('findAll', () => {
    it('debería listar tareas con paginación', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          status: 'TODO',
          priority: 'HIGH',
        },
        {
          id: 'task-2',
          title: 'Task 2',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
        },
      ];

      (prisma.task.count as jest.Mock).mockResolvedValue(2);
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const result = await taskService.findAll('user-id', 'ADMIN', {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('debería aplicar filtros correctamente', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Urgent Task',
          status: 'TODO',
          priority: 'URGENT',
        },
      ];

      (prisma.task.count as jest.Mock).mockResolvedValue(1);
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const result = await taskService.findAll('user-id', 'ADMIN', {
        priority: 'URGENT',
        status: 'TODO',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].priority).toBe('URGENT');
    });
  });
});
