// Configurar variables de entorno ANTES de cualquier import
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-minimum-32-characters-long-for-testing';
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

// Mock de jsonwebtoken ANTES de importar
jest.mock('jsonwebtoken');

import { JWTUtil } from '../../../src/utils/jwt.util';
import jwt from 'jsonwebtoken';

describe('JWTUtil', () => {
  const mockPayload = {
    userId: 'user-id',
    email: 'test@example.com',
    role: 'USER',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('debería generar un access token', () => {
      const mockToken = 'mock-access-token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = JWTUtil.generateAccessToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        expect.any(String),
        { expiresIn: '7d' }
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('generateRefreshToken', () => {
    it('debería generar un refresh token', () => {
      const mockToken = 'mock-refresh-token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = JWTUtil.generateRefreshToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        expect.any(String),
        { expiresIn: '30d' }
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('debería verificar un access token válido', () => {
      const mockToken = 'valid-token';
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = JWTUtil.verifyAccessToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
      expect(result).toEqual(mockPayload);
    });

    it('debería lanzar error con token inválido', () => {
      const mockToken = 'invalid-token';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => JWTUtil.verifyAccessToken(mockToken)).toThrow('Invalid or expired token');
    });
  });

  describe('verifyRefreshToken', () => {
    it('debería verificar un refresh token válido', () => {
      const mockToken = 'valid-refresh-token';
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = JWTUtil.verifyRefreshToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
      expect(result).toEqual(mockPayload);
    });

    it('debería lanzar error con refresh token inválido', () => {
      const mockToken = 'invalid-refresh-token';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => JWTUtil.verifyRefreshToken(mockToken)).toThrow('Invalid or expired refresh token');
    });
  });
});
