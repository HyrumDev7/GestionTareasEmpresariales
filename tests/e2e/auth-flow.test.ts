import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';

/**
 * Tests E2E - Flujos completos de autenticación
 * Estos tests requieren una base de datos de test real
 */
describe('E2E: Auth Flow', () => {
  let testUser: {
    email: string;
    password: string;
    name: string;
  };

  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'Password123',
      name: 'E2E Test User',
    };

    // Limpiar datos de test anteriores
    await prisma.task.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'test-',
        },
      },
    });
  });

  afterAll(async () => {
    // Limpiar después de todos los tests
    await prisma.task.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'test-',
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('Flujo completo: Registro → Login → Uso de API → Refresh Token', () => {
    it('debería completar el flujo completo de autenticación', async () => {
      // Paso 1: Registrar usuario
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(registerResponse.body.data.user.email).toBe(testUser.email);
      expect(registerResponse.body.data.accessToken).toBeDefined();
      expect(registerResponse.body.data.refreshToken).toBeDefined();

      accessToken = registerResponse.body.data.accessToken;
      refreshToken = registerResponse.body.data.refreshToken;

      // Paso 2: Hacer login
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(loginResponse.body.data.accessToken).toBeDefined();
      accessToken = loginResponse.body.data.accessToken;
      refreshToken = loginResponse.body.data.refreshToken;

      // Paso 3: Usar accessToken para acceder a recursos protegidos
      const projectsResponse = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(projectsResponse.body.message).toBe('Projects retrieved successfully');

      // Paso 4: Crear un proyecto
      const projectData = {
        name: 'E2E Test Project',
        description: 'Project created in E2E test',
      };

      const createProjectResponse = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(projectData)
        .expect(201);

      expect(createProjectResponse.body.data.name).toBe(projectData.name);
      const projectId = createProjectResponse.body.data.id;

      // Paso 5: Obtener estadísticas del proyecto
      const statsResponse = await request(app)
        .get(`/api/v1/projects/${projectId}/stats`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(statsResponse.body.data.totalTasks).toBeDefined();

      // Paso 6: Renovar token usando refresh token
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body.data.accessToken).toBeDefined();
      expect(refreshResponse.body.data.refreshToken).toBeDefined();

      // Paso 7: Usar el nuevo token
      const newAccessToken = refreshResponse.body.data.accessToken;
      const newProjectsResponse = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      expect(newProjectsResponse.body.message).toBe('Projects retrieved successfully');
    });
  });

  describe('Flujo: Crear proyecto y tareas', () => {
    let projectId: string;

    beforeAll(async () => {
      // Login para obtener token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('debería crear proyecto y tareas en secuencia', async () => {
      // Crear proyecto
      const projectResponse = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Project for Tasks',
          description: 'Project to test task creation',
        })
        .expect(201);

      projectId = projectResponse.body.data.id;

      // Crear tarea
      const taskResponse = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'E2E Test Task',
          description: 'Task created in E2E test',
          projectId,
          priority: 'HIGH',
        })
        .expect(201);

      const taskId = taskResponse.body.data.id;
      expect(taskId).toBeDefined();

      // Listar tareas con filtros
      const tasksResponse = await request(app)
        .get(`/api/v1/tasks?projectId=${projectId}&priority=HIGH`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(tasksResponse.body.data.length).toBeGreaterThan(0);
      expect(tasksResponse.body.pagination).toBeDefined();
    });
  });
});
