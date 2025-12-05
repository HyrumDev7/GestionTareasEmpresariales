"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const task_dto_1 = require("../dtos/task.dto");
const router = (0, express_1.Router)();
const taskController = new task_controller_1.TaskController();
router.use(auth_middleware_1.authenticate);
router.post('/', (0, validation_middleware_1.validate)(task_dto_1.createTaskSchema), (req, res) => taskController.create(req, res));
router.get('/', (req, res) => taskController.findAll(req, res));
router.get('/:id', (req, res) => taskController.findById(req, res));
router.put('/:id', (0, validation_middleware_1.validate)(task_dto_1.updateTaskSchema), (req, res) => taskController.update(req, res));
router.delete('/:id', (req, res) => taskController.delete(req, res));
exports.default = router;
//# sourceMappingURL=task.routes.js.map