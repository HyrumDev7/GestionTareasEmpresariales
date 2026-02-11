import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { createResourceRateLimiter } from '../middlewares/rateLimit.middleware';
import { createTaskSchema, updateTaskSchema } from '../dtos/task.dto';

const router = Router();
const taskController = new TaskController();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Crear nueva tarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - projectId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               projectId:
 *                 type: string
 *                 format: uuid
 *               assignedToId:
 *                 type: string
 *                 format: uuid
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 *       400:
 *         description: Error de validación
 */
router.post('/', createResourceRateLimiter, validate(createTaskSchema), (req, res) =>
  taskController.create(req, res)
);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Listar tareas con paginación y filtros
 *     tags: [Tasks]
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
 *         name: projectId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por proyecto
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED]
 *         description: Filtrar por estado
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         description: Filtrar por prioridad
 *       - in: query
 *         name: assignedToId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por usuario asignado
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en título o descripción
 *       - in: query
 *         name: dueDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar tareas desde esta fecha
 *       - in: query
 *         name: dueDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar tareas hasta esta fecha
 *     responses:
 *       200:
 *         description: Lista de tareas
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
 *                     $ref: '#/components/schemas/Task'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', (req, res) => taskController.findAll(req, res));

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Obtener tarea por ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tarea encontrada
 *       404:
 *         description: Tarea no encontrada
 */
router.get('/:id', (req, res) => taskController.findById(req, res));

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Actualizar tarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *               assignedToId:
 *                 type: string
 *                 format: uuid
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Tarea actualizada exitosamente
 *       404:
 *         description: Tarea no encontrada
 */
router.put('/:id', validate(updateTaskSchema), (req, res) => taskController.update(req, res));

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Eliminar tarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tarea eliminada exitosamente
 *       404:
 *         description: Tarea no encontrada
 */
router.delete('/:id', (req, res) => taskController.delete(req, res));

export default router;
