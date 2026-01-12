"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const jwt_util_1 = require("../utils/jwt.util");
class AuthService {
    async register(data) {
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new Error('Email already registered');
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const user = await database_1.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: 'USER',
            },
        });
        const accessToken = jwt_util_1.JWTUtil.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = jwt_util_1.JWTUtil.generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        };
    }
    async login(data) {
        const user = await database_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        const accessToken = jwt_util_1.JWTUtil.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = jwt_util_1.JWTUtil.generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        };
    }
    async getMe(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async refreshToken(refreshToken) {
        try {
            const decoded = jwt_util_1.JWTUtil.verifyRefreshToken(refreshToken);
            const user = await database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
            });
            if (!user) {
                throw new Error('User not found');
            }
            if (!user.isActive) {
                throw new Error('Account is deactivated');
            }
            const newAccessToken = jwt_util_1.JWTUtil.generateAccessToken({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            const newRefreshToken = jwt_util_1.JWTUtil.generateRefreshToken({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        }
        catch (error) {
            if (error.message?.includes('refresh token')) {
                throw new Error('Invalid or expired refresh token');
            }
            throw error;
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map