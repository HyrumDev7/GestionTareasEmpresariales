import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { createTaskSchema, updateTaskSchema } from '../dtos/task.dto';

const router = Router();
const taskController = new TaskController();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.post('/', validate(createTaskSchema), (req, res) => taskController.create(req, res));
router.get('/', (req, res) => taskController.findAll(req, res));
router.get('/:id', (req, res) => taskController.findById(req, res));
router.put('/:id', validate(updateTaskSchema), (req, res) => taskController.update(req, res));
router.delete('/:id', (req, res) => taskController.delete(req, res));

export default router;
