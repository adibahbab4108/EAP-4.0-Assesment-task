import { prisma } from '../../prisma/client';

export class NotificationsService {
  static async createNotification(userId: string, title: string, message: string) {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          title,
          message,
        },
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }

  static async getUserNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    return await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
