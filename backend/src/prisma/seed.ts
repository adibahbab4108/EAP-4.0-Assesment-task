import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data (in order of relations)
  await prisma.comment.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('Password123', 10);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: passwordHash,
      name: 'Alice Admin',
      role: Role.ADMIN,
    },
  });

  const pm = await prisma.user.create({
    data: {
      email: 'pm@example.com',
      password: passwordHash,
      name: 'Bob PM',
      role: Role.PROJECT_MANAGER,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: 'member@example.com',
      password: passwordHash,
      name: 'Adib Member',
      role: Role.TEAM_MEMBER,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      email: 'member2@example.com',
      password: passwordHash,
      name: 'David Member',
      role: Role.TEAM_MEMBER,
    },
  });

  console.log('Demo users created:');
  console.log(`- Admin: ${admin.email} (Password123)`);
  console.log(`- PM: ${pm.email} (Password123)`);
  console.log(`- Member 1: ${member1.email} (Password123)`);
  console.log(`- Member 2: ${member2.email} (Password123)`);

  // Create a Demo Project
  const project = await prisma.project.create({
    data: {
      name: 'E-Commerce Website Redesign',
      description: 'Revamping the storefront and product catalog for better conversion rates.',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'ACTIVE',
      memberIds: [pm.id, member1.id, member2.id],
    },
  });

  console.log(`Demo project "${project.name}" created.`);

  // Create Demo Tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Setup API Gateway and Auth Server',
      description: 'Implement JWT authentication and API route routing.',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      projectId: project.id,
      assignedToId: member1.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Design Database Schemas',
      description: 'Create Mongo schemas using Prisma client.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      projectId: project.id,
      assignedToId: member2.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Initial UI Wireframes',
      description: 'Design mockups and wireframes in Figma.',
      status: 'COMPLETED',
      priority: 'LOW',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Past due but completed
      projectId: project.id,
      assignedToId: member1.id,
    },
  });

  console.log('Demo tasks created.');

  // Create activity logs
  await prisma.activityLog.createMany({
    data: [
      { action: `Project "${project.name}" created`, userId: pm.id },
      { action: `Task "${task1.title}" created and assigned to ${member1.name}`, userId: pm.id },
      { action: `Task "${task2.title}" created and assigned to ${member2.name}`, userId: pm.id },
      { action: `Task "${task3.title}" marked as Completed`, userId: member1.id },
    ],
  });

  console.log('Activity logs seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
