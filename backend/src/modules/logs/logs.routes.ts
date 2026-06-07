import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { LogsController } from './logs.controller';

const router = Router();

router.use(authenticate);

router.get('/', LogsController.getLogs);

export default router;
