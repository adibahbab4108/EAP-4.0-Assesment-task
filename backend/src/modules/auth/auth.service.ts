import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/client';
import { config } from '../../config/config';
import { AppError } from '../../middleware/error.middleware';
import { LogsService } from '../logs/logs.service';
import { Role } from '@prisma/client';

export class AuthService {
  static async signup(data: any) {
    const { email, password, name, role } = data;

    if (!email || !password || !name) {
      throw new AppError('Email, password, and name are required.', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const validRole = Object.values(Role).includes(role) ? role : Role.TEAM_MEMBER;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: validRole,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    await LogsService.createLog(`User registered: ${name} (${validRole})`, user.id);

    return user;
  }

  static async login(data: any) {
    const { email, password } = data;

    if (!email || !password) {
      throw new AppError('Email and password are required.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = jwt.sign({ id: user.id }, config.JWT_SECRET, {
      expiresIn: '7d',
    });

    await LogsService.createLog(`User logged in: ${user.name}`, user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
