// Mock del servicio AI ANTES de importar app
const mockGenerateTaskFromText = jest.fn();
const mockSuggestTasksForProject = jest.fn();

jest.mock('../../src/services/ai.service', () => {
  return {
    AIService: jest.fn().mockImplementation(() => ({
      generateTaskFromText: mockGenerateTaskFromText,
      suggestTasksForProject: mockSuggestTasksForProject,
    })),
  };
});

import request from 'supertest';
import app from '../../src/app';
import { JWTUtil } from '../../src/utils/jwt.util';

describe('AI Routes', () => {
  let authToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateTaskFromText.mockClear();
    mockSuggestTasksForProject.mockClear();
    
    // Generar token de prueba
    authToken = JWTUtil.generateAccessToken({
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'ADMIN',
    });
  });

  describe('POST /api/v1/ai/generate-task', () => {
    it('debería generar una tarea con IA', async () => {
      const mockTaskData = {
        title: 'Revisar código',
        description: 'Revisar código del módulo de autenticación',
        priority: 'URGENT',
        dueDate: '2024-01-15',
        estimatedHours: 2,
        aiGenerated: true,
        originalInput: 'Revisar código del módulo de autenticación mañana, es urgente',
      };

      mockGenerateTaskFromText.mockResolvedValue(mockTaskData);

      const response = await request(app)
        .post('/api/v1/ai/generate-task')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userInput: 'Revisar código del módulo de autenticación mañana, es urgente',
        })
        .expect(200);

      expect(response.body.message).toBe('Task generated successfully by AI');
      expect(response.body.data.title).toBe(mockTaskData.title);
      expect(response.body.data.priority).toBe('URGENT');
    });

    it('debería retornar error 400 si falta userInput', async () => {
      const response = await request(app)
        .post('/api/v1/ai/generate-task')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/v1/ai/suggest-tasks', () => {
    it('debería sugerir tareas para un proyecto', async () => {
      const mockSuggestions = [
        {
          title: 'Configurar base de datos',
          description: 'Configurar PostgreSQL y Prisma',
          priority: 'HIGH',
          estimatedHours: 4,
        },
        {
          title: 'Implementar autenticación',
          description: 'Implementar JWT y bcrypt',
          priority: 'HIGH',
          estimatedHours: 6,
        },
      ];

      mockSuggestTasksForProject.mockResolvedValue(mockSuggestions);

      const response = await request(app)
        .post('/api/v1/ai/suggest-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectDescription: 'Desarrollar una aplicación web de gestión de tareas',
          count: 5,
        })
        .expect(200);

      expect(response.body.message).toContain('task suggestions');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
});
