/**
 * Extensión de tipos de Express
 * Agrega propiedades personalizadas al Request
 */

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
      requestId?: string;
      startTime?: number;
    }
  }
}

export {};
