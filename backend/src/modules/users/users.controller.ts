import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';

export class UsersController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UsersService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  static async getWorkload(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await UsersService.getWorkloadSummary();
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }
}
