import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);

      res.status(201).json({
        message: 'User registered successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Registration failed',
        message: error.message,
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);

      res.status(200).json({
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        error: 'Login failed',
        message: error.message,
      });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const user = await authService.getMe(userId);

      res.status(200).json({
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error: any) {
      res.status(404).json({
        error: 'User not found',
        message: error.message,
      });
    }
  }
}
