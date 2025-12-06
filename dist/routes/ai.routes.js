"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const aiController = new ai_controller_1.AIController();
router.use(auth_middleware_1.authenticate);
router.post('/generate-task', (req, res) => aiController.generateTask(req, res));
router.post('/suggest-tasks', (req, res) => aiController.suggestTasks(req, res));
router.post('/analyze', (req, res) => aiController.analyzeInput(req, res));
exports.default = router;
//# sourceMappingURL=ai.routes.js.map