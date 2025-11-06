"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const project_dto_1 = require("../dtos/project.dto");
const router = (0, express_1.Router)();
const projectController = new project_controller_1.ProjectController();
router.use(auth_middleware_1.authenticate);
router.post('/', (0, validation_middleware_1.validate)(project_dto_1.createProjectSchema), (req, res) => projectController.create(req, res));
router.get('/', (req, res) => projectController.findAll(req, res));
router.get('/:id', (req, res) => projectController.findById(req, res));
router.put('/:id', (0, validation_middleware_1.validate)(project_dto_1.updateProjectSchema), (req, res) => projectController.update(req, res));
router.delete('/:id', (req, res) => projectController.delete(req, res));
router.get('/:id/stats', (req, res) => projectController.getStats(req, res));
exports.default = router;
//# sourceMappingURL=project.routes.js.map