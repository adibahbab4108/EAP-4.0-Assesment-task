import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { TasksController } from './tasks.controller';
import { Role } from '@prisma/client';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const router = Router();

router.use(authenticate);

router.get('/', TasksController.getTasks);
router.get('/:id', TasksController.getTaskById);

// Admin & Project Manager can create tasks
router.post('/', authorize([Role.ADMIN, Role.PROJECT_MANAGER]), TasksController.create);

// Admin & Project Manager can delete tasks
router.delete('/:id', authorize([Role.ADMIN, Role.PROJECT_MANAGER]), TasksController.delete);

// Update is allowed for all authenticated users (service controls field-level RBAC)
router.put('/:id', TasksController.update);

// Comments and attachments are allowed for project members (verified in controller/service)
router.post('/:id/comments', TasksController.addComment);
router.post('/:id/attachments', upload.single('file'), TasksController.addAttachment);

export default router;
