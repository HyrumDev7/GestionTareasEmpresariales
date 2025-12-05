"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Task title must be at least 3 characters'),
    description: zod_1.z.string().optional(),
    projectId: zod_1.z.string().uuid('Invalid project ID'),
    assignedToId: zod_1.z.string().uuid('Invalid user ID').optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    dueDate: zod_1.z.string().datetime().optional(),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assignedToId: zod_1.z.string().uuid().optional(),
    dueDate: zod_1.z.string().datetime().optional(),
});
//# sourceMappingURL=task.dto.js.map