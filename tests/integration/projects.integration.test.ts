import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';

describe('Projects Integration Tests', () => {
  let accessToken: string;
  let userId: string;
  let projectId: string;

  beforeAll(async () => {
    // Limpiar base de datos
    await prisma.task.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});

    // Crear usuario de prueba
    const user = await prisma.user.create({
      data: {
        email: 'projecttest@example.com',
        password: '$2a$10$hashedpassword', // Password hasheado
        name: 'Project Test User',
        role: 'USER',
      },
    });
    userId = user.id;

    // Login para obtener token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'projecttest@example.com',
        password: 'Password123',
      });

    // Si el login falla, crear usuario con password correcto
    if (loginResponse.status !== 200) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Password123', 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      const retryLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'projecttest@example.com',
          password: 'Password123',
        });

      accessToken = retryLogin.body.data.accessToken;
    } else {
      accessToken = loginResponse.body.data.accessToken;
    }
  });

  afterAll(async () => {
    await prisma.task.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/v1/projects', () => {
    it('debería crear un proyecto exitosamente', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.message).toBe('Project created successfully');
      expect(response.body.data.name).toBe(projectData.name);
      expect(response.body.data.description).toBe(projectData.description);
      expect(response.body.data.ownerId).toBe(userId);

      projectId = response.body.data.id;
    });

    it('debería validar que el nombre sea requerido', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ description: 'Sin nombre' })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/projects', () => {
    it('debería listar proyectos con paginación', async () => {
      const response = await request(app)
        .get('/api/v1/projects?page=1&limit=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Projects retrieved successfully');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('debería filtrar proyectos por status', async () => {
      const response = await request(app)
        .get('/api/v1/projects?status=ACTIVE&page=1&limit=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    it('debería obtener un proyecto por ID', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Project retrieved successfully');
      expect(response.body.data.id).toBe(projectId);
    });

    it('debería retornar 404 si el proyecto no existe', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/v1/projects/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/projects/:id/stats', () => {
    it('debería obtener estadísticas del proyecto', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${projectId}/stats`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Project stats retrieved successfully');
      expect(response.body.data.totalTasks).toBeDefined();
      expect(response.body.data.completionPercentage).toBeDefined();
      expect(response.body.data.byStatus).toBeDefined();
      expect(response.body.data.byPriority).toBeDefined();
    });
  });
});
