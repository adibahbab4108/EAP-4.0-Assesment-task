import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { ProjectsController } from './projects.controller';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', ProjectsController.getProjects);
router.get('/:id', ProjectsController.getProjectById);

// Admin & Project Manager routes
router.post('/', authorize([Role.ADMIN, Role.PROJECT_MANAGER]), ProjectsController.create);
router.put('/:id', authorize([Role.ADMIN, Role.PROJECT_MANAGER]), ProjectsController.update);
router.delete('/:id', authorize([Role.ADMIN, Role.PROJECT_MANAGER]), ProjectsController.delete);
router.post('/:id/members', authorize([Role.ADMIN, Role.PROJECT_MANAGER]), ProjectsController.addMember);

export default router;
