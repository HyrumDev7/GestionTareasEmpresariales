"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openai_1 = __importDefault(require("openai"));
const env_1 = require("../config/env");
const logger_util_1 = require("../utils/logger.util");
class AIService {
    openai;
    constructor() {
        this.openai = new openai_1.default({
            apiKey: env_1.env.OPENAI_API_KEY,
        });
    }
    async generateTaskFromText(userInput, projectId) {
        try {
            logger_util_1.Logger.info('Generating task from AI', { input: userInput });
            const prompt = `
Eres un asistente que convierte texto natural en tareas estructuradas.

Usuario dice: "${userInput}"

Responde SOLO con un objeto JSON válido con esta estructura exacta:
{
  "title": "Título corto y claro de la tarea (máximo 50 caracteres)",
  "description": "Descripción detallada de la tarea",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "dueDate": "YYYY-MM-DD" (solo si se menciona fecha, sino null),
  "estimatedHours": número de horas estimadas (solo si se menciona, sino null)
}

Reglas:
- Si no se menciona prioridad, usa "MEDIUM"
- Si dice "urgente", "ya", "rápido", usa "URGENT"
- Si dice "importante", usa "HIGH"
- Si dice "cuando puedas", usa "LOW"
- La fecha debe ser en formato ISO (YYYY-MM-DD)
- Si dice "mañana", calcula la fecha de mañana
- Si dice "la próxima semana", usa el lunes siguiente
- NO incluyas texto adicional, SOLO el JSON
`;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un asistente experto en gestión de proyectos que convierte texto natural en tareas estructuradas. Respondes SOLO con JSON válido.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.3,
                max_tokens: 500,
            });
            const content = response.choices[0].message.content;
            if (!content) {
                throw new Error('No response from OpenAI');
            }
            const cleanContent = content.replace(/```json|```/g, '').trim();
            const taskData = JSON.parse(cleanContent);
            if (projectId) {
                taskData.projectId = projectId;
            }
            logger_util_1.Logger.success('Task generated successfully', { taskData });
            return {
                ...taskData,
                aiGenerated: true,
                originalInput: userInput,
            };
        }
        catch (error) {
            logger_util_1.Logger.error('Error generating task with AI', { error: error.message });
            if (error.message.includes('API key')) {
                throw new Error('OpenAI API key is invalid or expired');
            }
            if (error instanceof SyntaxError) {
                throw new Error('AI generated invalid response. Please try again.');
            }
            throw new Error(`AI generation failed: ${error.message}`);
        }
    }
    async suggestTasksForProject(projectDescription, count = 5) {
        try {
            logger_util_1.Logger.info('Suggesting tasks for project', { description: projectDescription });
            const prompt = `
Basándote en este proyecto: "${projectDescription}"

Sugiere ${count} tareas necesarias para completarlo exitosamente.

Responde SOLO con un array JSON con esta estructura exacta:
[
  {
    "title": "Título de la tarea",
    "description": "Descripción detallada",
    "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    "estimatedHours": número
  }
]

NO incluyas texto adicional, SOLO el array JSON.
`;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un experto en gestión de proyectos. Generas listas de tareas estructuradas y accionables.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.5,
                max_tokens: 1000,
            });
            const content = response.choices[0].message.content;
            if (!content) {
                throw new Error('No response from OpenAI');
            }
            const cleanContent = content.replace(/```json|```/g, '').trim();
            const tasks = JSON.parse(cleanContent);
            logger_util_1.Logger.success(`Generated ${tasks.length} task suggestions`);
            return tasks;
        }
        catch (error) {
            logger_util_1.Logger.error('Error suggesting tasks', { error: error.message });
            throw new Error(`Task suggestion failed: ${error.message}`);
        }
    }
    async analyzeInput(userInput) {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: `Analiza este texto y extrae: prioridad, fecha mencionada, y tiempo estimado: "${userInput}"`,
                    },
                ],
                temperature: 0.3,
                max_tokens: 200,
            });
            return response.choices[0].message.content;
        }
        catch (error) {
            throw new Error(`Analysis failed: ${error.message}`);
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=ai.service.js.map