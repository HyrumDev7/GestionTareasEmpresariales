"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const env_1 = require("./env");
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TaskMaster Pro API',
            version: '1.0.0',
            description: 'API REST para gestión de tareas empresariales con autenticación JWT, roles y integración con OpenAI',
            contact: {
                name: 'Hyrum Isaac Carrasco Inzunza',
                email: 'hyrumcarrasco7@gmail.com',
                url: 'https://github.com/HyrumDev7',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: `http://localhost:${env_1.env.PORT}`,
                description: 'Development server',
            },
            {
                url: 'https://api.taskmaster.pro',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error type',
                        },
                        message: {
                            type: 'string',
                            description: 'Error message',
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                        },
                        name: {
                            type: 'string',
                        },
                        role: {
                            type: 'string',
                            enum: ['ADMIN', 'MANAGER', 'USER'],
                        },
                        isActive: {
                            type: 'boolean',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Project: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        name: {
                            type: 'string',
                        },
                        description: {
                            type: 'string',
                        },
                        status: {
                            type: 'string',
                            enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED', 'ON_HOLD'],
                        },
                        startDate: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                        },
                        endDate: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                        },
                        ownerId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Task: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        title: {
                            type: 'string',
                        },
                        description: {
                            type: 'string',
                        },
                        status: {
                            type: 'string',
                            enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'],
                        },
                        priority: {
                            type: 'string',
                            enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
                        },
                        dueDate: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                        },
                        projectId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        assignedToId: {
                            type: 'string',
                            format: 'uuid',
                            nullable: true,
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        page: {
                            type: 'number',
                        },
                        limit: {
                            type: 'number',
                        },
                        total: {
                            type: 'number',
                        },
                        totalPages: {
                            type: 'number',
                        },
                        hasNextPage: {
                            type: 'boolean',
                        },
                        hasPreviousPage: {
                            type: 'boolean',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Auth',
                description: 'Endpoints de autenticación y autorización',
            },
            {
                name: 'Projects',
                description: 'Gestión de proyectos',
            },
            {
                name: 'Tasks',
                description: 'Gestión de tareas',
            },
            {
                name: 'AI',
                description: 'Integración con OpenAI para generación inteligente de tareas',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map