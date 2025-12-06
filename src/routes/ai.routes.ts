import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const aiController = new AIController();

// Todas las rutas de IA requieren autenticación
router.use(authenticate);

/**
 * @route POST /api/v1/ai/generate-task
 * @desc Genera una tarea estructurada desde texto natural
 * @access Private
 * @body { userInput: string, projectId?: string }
 */
router.post('/generate-task', (req, res) => aiController.generateTask(req, res));

/**
 * @route POST /api/v1/ai/suggest-tasks
 * @desc Sugiere tareas basadas en descripción de proyecto
 * @access Private
 * @body { projectDescription: string, count?: number }
 */
router.post('/suggest-tasks', (req, res) => aiController.suggestTasks(req, res));

/**
 * @route POST /api/v1/ai/analyze
 * @desc Analiza texto de entrada (debugging)
 * @access Private
 * @body { userInput: string }
 */
router.post('/analyze', (req, res) => aiController.analyzeInput(req, res));

export default router;
