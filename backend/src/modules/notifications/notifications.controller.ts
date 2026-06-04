import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { NotificationsService } from './notifications.service';

export class NotificationsController {
  static async getMyNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const notifications = await NotificationsService.getUserNotifications(userId);
      res.json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  static async markRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await NotificationsService.markAsRead(id, userId);
      res.json({ success: true, message: 'Notification marked as read.' });
    } catch (error) {
      next(error);
    }
  }

  static async markAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await NotificationsService.markAllAsRead(userId);
      res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (error) {
      next(error);
    }
  }
}
