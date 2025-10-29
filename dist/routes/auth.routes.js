"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const auth_dto_1 = require("../dtos/auth.dto");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
router.post('/register', (0, validation_middleware_1.validate)(auth_dto_1.registerSchema), (req, res) => authController.register(req, res));
router.post('/login', (0, validation_middleware_1.validate)(auth_dto_1.loginSchema), (req, res) => authController.login(req, res));
router.get('/me', auth_middleware_1.authenticate, (req, res) => authController.getMe(req, res));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map