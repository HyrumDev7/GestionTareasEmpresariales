import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { JWTUtil } from '../../src/utils/jwt.util';

jest.mock('../../src/config/database', () => ({
  prisma: {
    project: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    task: {
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Projects Routes', () => {
  let authToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Generar token de prueba
    authToken = JWTUtil.generateAccessToken({
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'ADMIN',
    });
  });

  describe('GET /api/v1/projects', () => {
    it('debería listar proyectos con autenticación', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Project 1',
          description: 'Description 1',
          status: 'ACTIVE',
          ownerId: 'user-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);
      (prisma.project.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Projects retrieved successfully');
      expect(response.body.data).toBeDefined();
    });

    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/v1/projects')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });

    it('debería aplicar paginación', async () => {
      (prisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.project.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app)
        .get('/api/v1/projects?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('POST /api/v1/projects', () => {
    it('debería crear un proyecto exitosamente', async () => {
      const projectData = {
        name: 'New Project',
        description: 'Project Description',
        status: 'ACTIVE',
      };

      const createdProject = {
        id: 'project-id',
        ...projectData,
        ownerId: 'test-user-id',
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.project.create as jest.Mock).mockResolvedValue(createdProject);

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.message).toBe('Project created successfully');
      expect(response.body.data.name).toBe(projectData.name);
    });
  });

  describe('GET /api/v1/projects/:id/stats', () => {
    it('debería obtener estadísticas del proyecto', async () => {
      const projectId = 'project-id';
      const project = {
        id: projectId,
        ownerId: 'test-user-id',
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(project);
      (prisma.task.groupBy as jest.Mock).mockResolvedValue([
        { status: 'TODO', _count: 5 },
        { status: 'DONE', _count: 10 },
      ]);
      (prisma.task.count as jest.Mock).mockResolvedValue(15);

      const response = await request(app)
        .get(`/api/v1/projects/${projectId}/stats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Project stats retrieved successfully');
      expect(response.body.data.totalTasks).toBe(15);
    });
  });
});
