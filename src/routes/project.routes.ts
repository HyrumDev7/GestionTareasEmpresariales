import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { createProjectSchema, updateProjectSchema } from '../dtos/project.dto';

const router = Router();
const projectController = new ProjectController();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   POST /api/v1/projects
 * @desc    Create a new project
 * @access  Private (All authenticated users)
 */
router.post('/', validate(createProjectSchema), (req, res) => projectController.create(req, res));

/**
 * @route   GET /api/v1/projects
 * @desc    Get all projects (ADMIN sees all, USER sees only theirs)
 * @access  Private
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
 * @route   GET /api/v1/projects/:id/stats
 * @desc    Get project statistics
 * @access  Private (Owner or ADMIN)
 */
router.get('/:id/stats', (req, res) => projectController.getStats(req, res));

export default router;
