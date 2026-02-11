import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { JWTUtil } from '../../src/utils/jwt.util';

jest.mock('../../src/config/database', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Tasks Routes', () => {
  let authToken: string;
  const mockUserId = 'test-user-id';
  const mockProjectId = 'project-id';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Generar token de prueba
    authToken = JWTUtil.generateAccessToken({
      userId: mockUserId,
      email: 'test@example.com',
      role: 'ADMIN',
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('debería listar tareas con autenticación', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'TODO',
          priority: 'HIGH',
          projectId: mockProjectId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
      (prisma.task.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Tasks retrieved successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    it('debería aplicar filtros de búsqueda', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.task.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app)
        .get('/api/v1/tasks?search=bug&priority=HIGH')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toBeDefined();
    });

    it('debería aplicar paginación', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.task.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app)
        .get('/api/v1/tasks?page=2&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('POST /api/v1/tasks', () => {
    it('debería crear una tarea exitosamente', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task Description',
        projectId: mockProjectId,
        priority: 'HIGH',
      };

      const mockProject = {
        id: mockProjectId,
        ownerId: mockUserId,
      };

      const createdTask = {
        id: 'task-id',
        ...taskData,
        status: 'TODO',
        assignedToId: null,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.task.create as jest.Mock).mockResolvedValue(createdTask);

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.data.title).toBe(taskData.title);
    });

    it('debería retornar error si el proyecto no existe', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task Description',
        projectId: '00000000-0000-0000-0000-000000000000', // UUID válido pero proyecto inexistente
        priority: 'MEDIUM' as const,
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(404);

      expect(response.body.error).toBe('Failed to create task');
      expect(response.body.message).toContain('Project not found');
    });
  });
});
