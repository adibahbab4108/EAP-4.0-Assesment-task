import { prisma } from '../../prisma/client';
import { AppError } from '../../middleware/error.middleware';
import { LogsService } from '../logs/logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TaskStatus, TaskPriority, Role } from '@prisma/client';

export class TasksService {
  static async createTask(data: any, userId: string) {
    const { title, description, priority, dueDate, projectId, assignedToId } = data;

    if (!title || !projectId || !dueDate) {
      throw new AppError('Title, project ID, and due date are required.', 400);
    }

    // 1. Prevent duplicate task titles inside the same project
    const existingTask = await prisma.task.findFirst({
      where: { projectId, title: { equals: title, mode: 'insensitive' } },
    });
    if (existingTask) {
      throw new AppError('This task already exists in the project.', 400);
    }

    // 2. Prevent setting past dates as deadlines
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dueDate);
    if (selectedDate < today) {
      throw new AppError('Please select a valid deadline.', 400);
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description: description || '',
        status: TaskStatus.TODO,
        priority: priority || TaskPriority.MEDIUM,
        dueDate: selectedDate,
        projectId,
        assignedToId: assignedToId || null,
      },
      include: {
        project: true,
        assignedTo: true,
      },
    });

    await LogsService.createLog(`Task "${title}" created under project "${task.project.name}"`, userId);

    if (assignedToId) {
      await NotificationsService.createNotification(
        assignedToId,
        'New Task Assigned',
        `You have been assigned the task "${title}" in project "${task.project.name}".`
      );

      const assigneeName = task.assignedTo?.name || 'a member';
      await LogsService.createLog(`Task "${title}" assigned to ${assigneeName}`, userId);
    }

    return task;
  }

  static async updateTask(id: string, data: any, userId: string, role: Role) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true, assignedTo: true },
    });

    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    // RBAC check
    if (role === Role.TEAM_MEMBER) {
      // Team members can only update tasks assigned to them
      if (task.assignedToId !== userId) {
        throw new AppError('Access denied. You can only update tasks assigned to you.', 403);
      }

      // Team members can only update status
      const { status } = data;
      if (!status) {
        throw new AppError('Team members can only update task status.', 400);
      }

      if (!Object.values(TaskStatus).includes(status)) {
        throw new AppError('Invalid task status.', 400);
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: { status },
        include: { assignedTo: true },
      });

      await LogsService.createLog(`Task "${task.title}" status updated to "${status}"`, userId);

      return updatedTask;
    }

    // Admin & Project Manager can update all fields
    const { title, description, status, priority, dueDate, assignedToId } = data;
    const updateData: any = {};

    // 1. Prevent duplicate task titles inside the same project
    if (title && title.toLowerCase() !== task.title.toLowerCase()) {
      const duplicate = await prisma.task.findFirst({
        where: {
          projectId: task.projectId,
          title: { equals: title, mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new AppError('This task already exists in the project.', 400);
      }
      updateData.title = title;
    }

    // 2. Prevent setting past dates as deadlines
    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(dueDate);
      if (selectedDate < today && selectedDate.getTime() !== new Date(task.dueDate).getTime()) {
        throw new AppError('Please select a valid deadline.', 400);
      }
      updateData.dueDate = selectedDate;
    }

    // 3. Prevent assigning completed tasks -> Completed tasks cannot be reassigned
    if (assignedToId !== undefined && assignedToId !== task.assignedToId) {
      if (task.status === TaskStatus.COMPLETED) {
        throw new AppError('Completed tasks cannot be reassigned.', 400);
      }
      updateData.assignedToId = assignedToId || null;
    }

    if (description !== undefined) updateData.description = description;

    if (status) {
      if (Object.values(TaskStatus).includes(status)) {
        updateData.status = status;
      } else {
        throw new AppError('Invalid task status.', 400);
      }
    }

    if (priority) {
      if (Object.values(TaskPriority).includes(priority)) {
        updateData.priority = priority;
      } else {
        throw new AppError('Invalid task priority.', 400);
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: { assignedTo: true, project: true },
    });

    // Logging & Notifications
    if (status && status !== task.status) {
      await LogsService.createLog(`Task "${task.title}" status marked as ${status}`, userId);
    }

    if (assignedToId !== undefined && assignedToId !== task.assignedToId) {
      if (assignedToId) {
        await NotificationsService.createNotification(
          assignedToId,
          'Task Assigned',
          `You have been assigned the task "${updatedTask.title}" in project "${updatedTask.project.name}".`
        );
        await LogsService.createLog(
          `Task "${updatedTask.title}" assigned to ${updatedTask.assignedTo?.name}`,
          userId
        );
      } else {
        await LogsService.createLog(`Task "${updatedTask.title}" unassigned`, userId);
      }
    }

    return updatedTask;
  }

  static async deleteTask(id: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    await prisma.task.delete({ where: { id } });
    await LogsService.createLog(`Task "${task.title}" deleted`, userId);

    return { id };
  }

  static async getTasks(userId: string, role: Role, search?: string, status?: string, priority?: string, projectId?: string) {
    const whereClause: any = {};

    // RBAC: Non-admins can only see tasks of projects they belong to
    if (role !== Role.ADMIN) {
      whereClause.project = {
        memberIds: { has: userId },
      };
    }

    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
      whereClause.status = status as TaskStatus;
    }

    if (priority && Object.values(TaskPriority).includes(priority as TaskPriority)) {
      whereClause.priority = priority as TaskPriority;
    }

    return await prisma.task.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getTaskById(id: string, userId: string, role: Role) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
      },
    });

    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    // Access check: User must be project member or Admin
    if (role !== Role.ADMIN && !task.project.memberIds.includes(userId)) {
      throw new AppError('Access denied. You are not a member of the project containing this task.', 403);
    }

    return task;
  }

  static async addComment(taskId: string, text: string, userId: string) {
    if (!text || text.trim() === '') {
      throw new AppError('Comment text cannot be empty.', 400);
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        taskId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Notify assignee if someone else comments
    if (task.assignedToId && task.assignedToId !== userId) {
      await NotificationsService.createNotification(
        task.assignedToId,
        'New Comment on Task',
        `A new comment was added to your task "${task.title}".`
      );
    }

    return comment;
  }

  static async addAttachment(taskId: string, file: any) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
        taskId,
      },
    });

    return attachment;
  }
}
