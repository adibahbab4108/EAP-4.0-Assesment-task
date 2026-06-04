import { prisma } from '../../prisma/client';
import { AppError } from '../../middleware/error.middleware';
import { LogsService } from '../logs/logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ProjectStatus, Role } from '@prisma/client';

export class ProjectsService {
  static async createProject(data: any, userId: string) {
    const { name, description, deadline, memberIds = [] } = data;

    if (!name || !description || !deadline) {
      throw new AppError('Name, description, and deadline are required.', 400);
    }

    // Ensure the creator is included in memberIds if not already
    const uniqueMemberIds = Array.from(new Set([userId, ...memberIds]));

    const project = await prisma.project.create({
      data: {
        name,
        description,
        deadline: new Date(deadline),
        memberIds: uniqueMemberIds,
        status: ProjectStatus.ACTIVE,
      },
    });

    await LogsService.createLog(`Project "${name}" created`, userId);

    // Notify other members
    for (const memberId of uniqueMemberIds) {
      if (memberId !== userId) {
        await NotificationsService.createNotification(
          memberId,
          'New Project Invitation',
          `You have been added to project "${name}".`
        );
      }
    }

    return project;
  }

  static async updateProject(id: string, data: any, userId: string) {
    const { name, description, deadline, status, memberIds } = data;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (deadline) updateData.deadline = new Date(deadline);
    if (status) {
      if (Object.values(ProjectStatus).includes(status)) {
        updateData.status = status;
      } else {
        throw new AppError('Invalid project status.', 400);
      }
    }
    if (memberIds) {
      // Ensure we preserve the creator or members
      updateData.memberIds = Array.from(new Set(memberIds));
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    await LogsService.createLog(`Project "${updatedProject.name}" updated`, userId);

    return updatedProject;
  }

  static async deleteProject(id: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    await prisma.project.delete({ where: { id } });
    await LogsService.createLog(`Project "${project.name}" deleted`, userId);

    return { id };
  }

  static async getProjects(userId: string, role: Role, search?: string, status?: string) {
    const whereClause: any = {};

    // RBAC: Admins see all projects. PMs and Members see projects they belong to.
    if (role !== Role.ADMIN) {
      whereClause.memberIds = { has: userId };
    }

    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }

    if (status && Object.values(ProjectStatus).includes(status as ProjectStatus)) {
      whereClause.status = status as ProjectStatus;
    }

    return await prisma.project.findMany({
      where: whereClause,
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        tasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getProjectById(id: string, userId: string, role: Role) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    // Check if user is member of project or is admin
    if (role !== Role.ADMIN && !project.memberIds.includes(userId)) {
      throw new AppError('Access denied. You are not a member of this project.', 403);
    }

    return project;
  }

  static async addMember(id: string, email: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      throw new AppError(`User with email "${email}" not found.`, 404);
    }

    if (project.memberIds.includes(userToAdd.id)) {
      throw new AppError('User is already a member of this project.', 400);
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        memberIds: {
          push: userToAdd.id,
        },
      },
    });

    // Notify user
    await NotificationsService.createNotification(
      userToAdd.id,
      'Project Added',
      `You have been added to the project "${project.name}" by another team member.`
    );

    await LogsService.createLog(
      `Member "${userToAdd.name}" added to project "${project.name}"`,
      userId
    );

    return updatedProject;
  }
}
