import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ProjectsService } from './projects.service';

export class ProjectsController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectsService.createProject(req.body, req.user!.id);
      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectsService.updateProject(req.params.id, req.body, req.user!.id);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ProjectsService.deleteProject(req.params.id, req.user!.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search, status } = req.query;
      const projects = await ProjectsService.getProjects(
        req.user!.id,
        req.user!.role,
        search as string,
        status as string
      );
      res.json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  }

  static async getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectsService.getProjectById(req.params.id, req.user!.id, req.user!.role);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  static async addMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const project = await ProjectsService.addMember(req.params.id, email, req.user!.id);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }
}
