// Configurar variables de entorno ANTES de importar
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

import { ProjectService } from '../../../src/services/project.service';
import { prisma } from '../../../src/config/database';

// Mock de Prisma
jest.mock('../../../src/config/database', () => ({
  prisma: {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    task: {
      groupBy: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('ProjectService', () => {
  let projectService: ProjectService;

  beforeEach(() => {
    projectService = new ProjectService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un proyecto exitosamente', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
        projectId: 'project-id',
      };

      const ownerId = 'owner-id';
      const createdProject = {
        id: 'project-id',
        ...projectData,
        ownerId,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: {
          id: ownerId,
          name: 'Owner',
          email: 'owner@example.com',
          role: 'USER',
        },
      };

      (prisma.project.create as jest.Mock).mockResolvedValue(createdProject);

      const result = await projectService.create(projectData, ownerId);

      expect(prisma.project.create).toHaveBeenCalled();
      expect(result.id).toBe(createdProject.id);
      expect(result.name).toBe(projectData.name);
      expect(result.ownerId).toBe(ownerId);
    });
  });

  describe('findAll', () => {
    it('debería listar proyectos con paginación', async () => {
      const userId = 'user-id';
      const userRole = 'USER';
      const projects = [
        {
          id: 'project-1',
          name: 'Project 1',
          ownerId: userId,
        },
        {
          id: 'project-2',
          name: 'Project 2',
          ownerId: userId,
        },
      ];

      (prisma.project.count as jest.Mock).mockResolvedValue(2);
      (prisma.project.findMany as jest.Mock).mockResolvedValue(projects);

      const result = await projectService.findAll(userId, userRole, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('debería aplicar filtros de búsqueda', async () => {
      const userId = 'user-id';
      const userRole = 'USER';

      (prisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.project.count as jest.Mock).mockResolvedValue(0);

      await projectService.findAll(userId, userRole, {
        page: 1,
        limit: 10,
        search: 'test',
      });

      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      );
    });
  });

  describe('getStats', () => {
    it('debería retornar estadísticas del proyecto', async () => {
      const projectId = 'project-id';
      const userId = 'user-id';
      const userRole = 'USER';

      const mockProject = {
        id: projectId,
        ownerId: userId,
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.task.groupBy as jest.Mock).mockResolvedValue([
        { status: 'TODO', _count: 5 },
        { status: 'DONE', _count: 10 },
      ]);
      (prisma.task.count as jest.Mock).mockResolvedValue(15);

      const stats = await projectService.getStats(projectId, userId, userRole);

      expect(stats.totalTasks).toBe(15);
      expect(stats.completedTasks).toBeDefined();
      expect(stats.byStatus).toBeDefined();
      expect(stats.byPriority).toBeDefined();
    });
  });
});
