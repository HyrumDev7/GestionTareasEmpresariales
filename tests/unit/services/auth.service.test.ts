// Configurar variables de entorno ANTES de cualquier import
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-minimum-32-characters-long-for-testing';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_taskmaster?schema=public';
process.env.OPENAI_API_KEY = 'sk-test-openai-api-key-minimum-20-characters';
process.env.PORT = '3000';
process.env.API_VERSION = 'v1';
process.env.JWT_EXPIRES_IN = '7d';
process.env.JWT_REFRESH_EXPIRES_IN = '30d';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.LOG_LEVEL = 'info';

// Mock de Prisma ANTES de importar servicios
jest.mock('../../../src/config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock de bcrypt
jest.mock('bcryptjs');

import { AuthService } from '../../../src/services/auth.service';
import { prisma } from '../../../src/config/database';
import bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      const hashedPassword = 'hashed-password';
      const createdUser = {
        id: 'user-id',
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: 'USER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await authService.register(userData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.user.email).toBe(userData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('debería lanzar error si el email ya está registrado', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-id',
        email: userData.email,
      });

      await expect(authService.register(userData)).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('debería hacer login exitosamente con credenciales válidas', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const user = {
        id: 'user-id',
        email: loginData.email,
        password: 'hashed-password',
        name: 'Test User',
        role: 'USER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(loginData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, user.password);
      expect(result.user.email).toBe(loginData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('debería lanzar error con credenciales inválidas', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('debería lanzar error si la cuenta está desactivada', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const user = {
        id: 'user-id',
        email: loginData.email,
        password: 'hashed-password',
        name: 'Test User',
        role: 'USER',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      await expect(authService.login(loginData)).rejects.toThrow('Account is deactivated');
    });
  });
});
