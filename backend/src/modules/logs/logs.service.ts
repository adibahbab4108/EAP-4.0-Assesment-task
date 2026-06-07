import { prisma } from '../../prisma/client';

export class LogsService {
  static async createLog(action: string, userId?: string) {
    try {
      return await prisma.activityLog.create({
        data: {
          action,
          userId: userId || null,
        },
      });
    } catch (error) {
      console.error('Failed to write activity log:', error);
    }
  }

  static async getLogs(limit: number = 10) {
    return await prisma.activityLog.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
