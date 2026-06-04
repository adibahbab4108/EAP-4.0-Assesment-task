import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { NotificationsController } from './notifications.controller';

const router = Router();

router.use(authenticate);

router.get('/', NotificationsController.getMyNotifications);
router.put('/mark-all-read', NotificationsController.markAllRead);
router.put('/:id/read', NotificationsController.markRead);

export default router;
