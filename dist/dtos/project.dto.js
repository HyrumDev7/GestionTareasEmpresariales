"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, 'Project name must be at least 3 characters'),
    description: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
exports.updateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, 'Project name must be at least 3 characters').optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED', 'ON_HOLD']).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
//# sourceMappingURL=project.dto.js.map