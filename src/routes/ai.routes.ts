import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const aiController = new AIController();

// Todas las rutas de IA requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/v1/ai/generate-task:
 *   post:
 *     summary: Generar tarea estructurada desde texto natural usando IA
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userInput
 *             properties:
 *               userInput:
 *                 type: string
 *                 description: Texto en lenguaje natural describiendo la tarea
 *                 example: "Revisar código del módulo de autenticación mañana, es urgente"
 *               projectId:
 *                 type: string
 *                 format: uuid
 *                 description: ID del proyecto (opcional)
 *     responses:
 *       200:
 *         description: Tarea generada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     priority:
 *                       type: string
 *                       enum: [LOW, MEDIUM, HIGH, URGENT]
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                     estimatedHours:
 *                       type: number
 *                     aiGenerated:
 *                       type: boolean
 *       401:
 *         description: API key de OpenAI inválida
 *       429:
 *         description: Rate limit de OpenAI excedido
 */
router.post('/generate-task', (req, res) => aiController.generateTask(req, res));

/**
 * @swagger
 * /api/v1/ai/suggest-tasks:
 *   post:
 *     summary: Sugerir tareas basadas en descripción de proyecto usando IA
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectDescription
 *             properties:
 *               projectDescription:
 *                 type: string
 *                 description: Descripción del proyecto
 *                 example: "Desarrollar una aplicación web de gestión de tareas"
 *               count:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 default: 5
 *                 description: Número de tareas a sugerir
 *     responses:
 *       200:
 *         description: Tareas sugeridas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       priority:
 *                         type: string
 *                         enum: [LOW, MEDIUM, HIGH, URGENT]
 *                       estimatedHours:
 *                         type: number
 *       401:
 *         description: API key de OpenAI inválida
 *       429:
 *         description: Rate limit de OpenAI excedido
 */
router.post('/suggest-tasks', (req, res) => aiController.suggestTasks(req, res));

/**
 * @swagger
 * /api/v1/ai/analyze:
 *   post:
 *     summary: Analizar texto de entrada (útil para debugging)
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userInput
 *             properties:
 *               userInput:
 *                 type: string
 *                 description: Texto a analizar
 *     responses:
 *       200:
 *         description: Análisis completado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     analysis:
 *                       type: string
 *                     originalInput:
 *                       type: string
 */
router.post('/analyze', (req, res) => aiController.analyzeInput(req, res));

export default router;
