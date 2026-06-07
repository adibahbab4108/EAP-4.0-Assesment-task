import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.signup(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, user } = await AuthService.login(req.body);
      
      const isProd = process.env.NODE_ENV === 'production';
      // Set token as HttpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: isProd, // Requires https in production
        sameSite: isProd ? 'none' : 'lax', // 'none' required for cross-site cookies
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      res.json({ success: true, token, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('token');
      res.json({ success: true, message: 'Logged out successfully.' });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, data: req.user });
    } catch (error) {
      next(error);
    }
  }
}
