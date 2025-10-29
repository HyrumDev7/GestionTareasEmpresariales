"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
class AuthController {
    async register(req, res) {
        try {
            const result = await authService.register(req.body);
            res.status(201).json({
                message: 'User registered successfully',
                data: result,
            });
        }
        catch (error) {
            res.status(400).json({
                error: 'Registration failed',
                message: error.message,
            });
        }
    }
    async login(req, res) {
        try {
            const result = await authService.login(req.body);
            res.status(200).json({
                message: 'Login successful',
                data: result,
            });
        }
        catch (error) {
            res.status(401).json({
                error: 'Login failed',
                message: error.message,
            });
        }
    }
    async getMe(req, res) {
        try {
            const userId = req.user.userId;
            const user = await authService.getMe(userId);
            res.status(200).json({
                message: 'User retrieved successfully',
                data: user,
            });
        }
        catch (error) {
            res.status(404).json({
                error: 'User not found',
                message: error.message,
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map