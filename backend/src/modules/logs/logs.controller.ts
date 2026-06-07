import { Request, Response, NextFunction } from 'express';
import { LogsService } from './logs.service';

export class LogsController {
  static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const logs = await LogsService.getLogs(limit);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }
}
