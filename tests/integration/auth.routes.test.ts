import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { JWTUtil } from '../../src/utils/jwt.util';

// Mock de Prisma
jest.mock('../../src/config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock de bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock de JWTUtil
jest.mock('../../src/utils/jwt.util', () => ({
  JWTUtil: {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  },
}));

import bcrypt from 'bcryptjs';

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('debería registrar un nuevo usuario', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'New User',
      };

      const hashedPassword = 'hashed-password';
      const createdUser = {
        id: 'user-id',
        ...userData,
        password: hashedPassword,
        role: 'USER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);
      (JWTUtil.generateAccessToken as jest.Mock).mockReturnValue('mock-access-token');
      (JWTUtil.generateRefreshToken as jest.Mock).mockReturnValue('mock-refresh-token');

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('debería retornar error 400 si el email ya existe', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'Password123',
        name: 'Existing User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-id',
        email: userData.email,
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Registration failed');
      expect(response.body.message).toContain('Email already registered');
    });

    it('debería retornar error 400 si faltan campos requeridos', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          // Falta password y name
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('debería hacer login exitosamente', async () => {
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
      (JWTUtil.generateAccessToken as jest.Mock).mockReturnValue('mock-access-token');
      (JWTUtil.generateRefreshToken as jest.Mock).mockReturnValue('mock-refresh-token');

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('debería retornar error 401 con credenciales inválidas', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Login failed');
      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    it('debería renovar tokens exitosamente', async () => {
      const refreshTokenData = {
        refreshToken: 'valid-refresh-token',
      };

      const decodedToken = {
        userId: 'user-id',
        email: 'test@example.com',
        role: 'USER',
      };

      const user = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'USER',
        isActive: true,
      };

      // Mock de JWTUtil
      (JWTUtil.verifyRefreshToken as jest.Mock).mockReturnValue(decodedToken);
      (JWTUtil.generateAccessToken as jest.Mock).mockReturnValue('new-access-token');
      (JWTUtil.generateRefreshToken as jest.Mock).mockReturnValue('new-refresh-token');

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send(refreshTokenData)
        .expect(200);

      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('debería retornar error 401 con refresh token inválido', async () => {
      const refreshTokenData = {
        refreshToken: 'invalid-refresh-token',
      };

      // Mock de JWTUtil.verifyRefreshToken que lanza error
      (JWTUtil.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid or expired refresh token');
      });

      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send(refreshTokenData)
        .expect(401);

      expect(response.body.error).toBe('Token refresh failed');
    });
  });
});
