import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { createResourceRateLimiter } from '../middlewares/rateLimit.middleware';
import { createProjectSchema, updateProjectSchema } from '../dtos/project.dto';

const router = Router();
const projectController = new ProjectController();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     summary: Crear nuevo proyecto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETED, ARCHIVED, ON_HOLD]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Proyecto creado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post('/', createResourceRateLimiter, validate(createProjectSchema), (req, res) =>
  projectController.create(req, res)
);

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     summary: Listar proyectos con paginación y filtros
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, COMPLETED, ARCHIVED, ON_HOLD]
 *         description: Filtrar por estado
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en nombre o descripción
 *     responses:
 *       200:
 *         description: Lista de proyectos
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
 *                     $ref: '#/components/schemas/Project'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', (req, res) => projectController.findAll(req, res));

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Get project by ID
 * @access  Private (Owner or ADMIN)
 */
router.get('/:id', (req, res) => projectController.findById(req, res));

/**
 * @route   PUT /api/v1/projects/:id
 * @desc    Update project
 * @access  Private (Owner or ADMIN)
 */
router.put('/:id', validate(updateProjectSchema), (req, res) => projectController.update(req, res));

/**
 * @route   DELETE /api/v1/projects/:id
 * @desc    Delete project
 * @access  Private (Owner or ADMIN)
 */
router.delete('/:id', (req, res) => projectController.delete(req, res));

/**
 * @swagger
 * /api/v1/projects/{id}/stats:
 *   get:
 *     summary: Obtener estadísticas del proyecto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Estadísticas del proyecto
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
 *                     totalTasks:
 *                       type: number
 *                     completedTasks:
 *                       type: number
 *                     inProgressTasks:
 *                       type: number
 *                     overdueTasks:
 *                       type: number
 *                     urgentTasks:
 *                       type: number
 *                     completionPercentage:
 *                       type: number
 *                     byStatus:
 *                       type: object
 *                     byPriority:
 *                       type: object
 */
router.get('/:id/stats', (req, res) => projectController.getStats(req, res));

export default router;
