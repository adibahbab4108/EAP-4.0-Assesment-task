import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { TasksService } from './tasks.service';

export class TasksController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await TasksService.createTask(req.body, req.user!.id);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await TasksService.updateTask(
        req.params.id,
        req.body,
        req.user!.id,
        req.user!.role
      );
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await TasksService.deleteTask(req.params.id, req.user!.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search, status, priority, projectId } = req.query;
      const tasks = await TasksService.getTasks(
        req.user!.id,
        req.user!.role,
        search as string,
        status as string,
        priority as string,
        projectId as string
      );
      res.json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await TasksService.getTaskById(req.params.id, req.user!.id, req.user!.role);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async addComment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { text } = req.body;
      const comment = await TasksService.addComment(req.params.id, text, req.user!.id);
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }

  static async addAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
      }
      const attachment = await TasksService.addAttachment(req.params.id, req.file);
      res.status(201).json({ success: true, data: attachment });
    } catch (error) {
      next(error);
    }
  }
}
