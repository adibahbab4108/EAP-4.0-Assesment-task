import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { UsersController } from './users.controller';

const router = Router();

router.use(authenticate);

router.get('/', UsersController.getAll);
router.get('/workload', UsersController.getWorkload);

export default router;
