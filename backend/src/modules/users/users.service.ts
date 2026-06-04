import { prisma } from '../../prisma/client';
import { TaskStatus } from '@prisma/client';

export class UsersService {
  static async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getWorkloadSummary() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        assignedTasks: {
          select: {
            status: true,
          },
        },
      },
    });

    return users.map(user => {
      const total = user.assignedTasks.length;
      const completed = user.assignedTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
      const pending = total - completed;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        workload: {
          total,
          completed,
          pending,
        },
      };
    });
  }
}
