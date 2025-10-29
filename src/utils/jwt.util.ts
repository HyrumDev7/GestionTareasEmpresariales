import * as jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export class JWTUtil {
  static generateAccessToken(payload: JWTPayload): string {
    // @ts-ignore - expiresIn type issue with jsonwebtoken
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }

  static generateRefreshToken(payload: JWTPayload): string {
    // @ts-ignore - expiresIn type issue with jsonwebtoken
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
