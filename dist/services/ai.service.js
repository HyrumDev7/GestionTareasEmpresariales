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
        if (!env_1.env.OPENAI_API_KEY || env_1.env.OPENAI_API_KEY.length < 20) {
            logger_util_1.Logger.warn('OpenAI API key is missing or invalid. AI features will not work.');
        }
        this.openai = new openai_1.default({
            apiKey: env_1.env.OPENAI_API_KEY,
        });
    }
    async generateTaskFromText(userInput, projectId) {
        try {
            logger_util_1.Logger.info('Generating task from AI', { input: userInput });
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            const prompt = `Eres un asistente experto en gestión de proyectos que convierte texto natural en tareas estructuradas.

Fecha de hoy: ${today.toISOString().split('T')[0]}

El usuario dice: "${userInput}"

Tu tarea es convertir esto en una tarea estructurada. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin explicaciones.

Formato exacto requerido:
{
  "title": "Título corto y claro (máximo 60 caracteres)",
  "description": "Descripción detallada y accionable",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "dueDate": "YYYY-MM-DD" o null,
  "estimatedHours": número o null
}

REGLAS:
1. PRIORIDAD:
   - "URGENT": si menciona "urgente", "ya", "inmediato", "rápido", "asap", "crítico"
   - "HIGH": si menciona "importante", "prioritario", "alta prioridad"
   - "LOW": si menciona "cuando puedas", "sin prisa", "opcional", "baja prioridad"
   - "MEDIUM": por defecto si no se menciona

2. FECHA (dueDate):
   - Si menciona "mañana" → ${tomorrow.toISOString().split('T')[0]}
   - Si menciona "próxima semana" → ${nextWeek.toISOString().split('T')[0]}
   - Si menciona una fecha específica, úsala en formato YYYY-MM-DD
   - Si no menciona fecha → null

3. HORAS ESTIMADAS (estimatedHours):
   - Si menciona tiempo (ej: "2 horas", "medio día", "1 día") → convierte a horas
   - Si no menciona → null

4. TÍTULO: Debe ser conciso, claro y accionable

5. DESCRIPCIÓN: Debe ser detallada y explicar qué se debe hacer

IMPORTANTE: Responde SOLO con el JSON, sin backticks, sin texto adicional.`;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un asistente experto en gestión de proyectos. Tu única función es convertir texto natural en tareas estructuradas. SIEMPRE respondes SOLO con JSON válido, sin texto adicional, sin markdown, sin explicaciones.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.2,
                max_tokens: 600,
            });
            const content = response.choices[0].message.content;
            if (!content) {
                throw new Error('No response from OpenAI');
            }
            let cleanContent = content.replace(/```json|```/g, '').trim();
            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanContent = jsonMatch[0];
            }
            let taskData;
            try {
                taskData = JSON.parse(cleanContent);
            }
            catch (parseError) {
                logger_util_1.Logger.error('Failed to parse AI response as JSON', { content: cleanContent.substring(0, 200) });
                throw new Error('AI generated invalid JSON response. Please try again.');
            }
            if (!taskData.title || typeof taskData.title !== 'string') {
                throw new Error('AI response missing required field: title');
            }
            const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
            if (taskData.priority && !validPriorities.includes(taskData.priority)) {
                taskData.priority = 'MEDIUM';
            }
            else if (!taskData.priority) {
                taskData.priority = 'MEDIUM';
            }
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
            if (error.status === 401 || error.message?.includes('API key') || error.message?.includes('authentication')) {
                throw new Error('OpenAI API key is invalid or expired. Please check your OPENAI_API_KEY environment variable.');
            }
            if (error.status === 429 || error.message?.includes('rate limit') || error.message?.includes('quota')) {
                throw new Error('OpenAI API rate limit exceeded. Please try again later.');
            }
            if (error.status === 500 || error.status === 503) {
                throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
            }
            if (error instanceof SyntaxError || error.message?.includes('JSON')) {
                throw new Error('AI generated invalid JSON response. Please try again with different wording.');
            }
            throw new Error(`AI generation failed: ${error.message || 'Unknown error'}`);
        }
    }
    async suggestTasksForProject(projectDescription, count = 5) {
        try {
            logger_util_1.Logger.info('Suggesting tasks for project', { description: projectDescription });
            const taskCount = Math.min(Math.max(1, Math.round(count)), 20);
            const prompt = `Eres un experto en gestión de proyectos y planificación.

Basándote en esta descripción de proyecto: "${projectDescription}"

Genera exactamente ${taskCount} tareas necesarias, estructuradas y accionables para completar este proyecto exitosamente. Las tareas deben ser:
- Específicas y medibles
- Ordenadas lógicamente (de más importante/urgente a menos)
- Con prioridades apropiadas según su importancia
- Con estimaciones de tiempo realistas

Responde ÚNICAMENTE con un array JSON con esta estructura exacta:
[
  {
    "title": "Título corto y claro de la tarea",
    "description": "Descripción detallada y accionable",
    "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    "estimatedHours": número (horas estimadas, mínimo 0.5)
  }
]

REGLAS:
- El array debe tener exactamente ${taskCount} elementos
- Prioridades: asigna según importancia y urgencia del proyecto
- Horas estimadas: deben ser números realistas (0.5 a 40 horas por tarea)
- Títulos: máximo 60 caracteres, claros y accionables
- Descripciones: detalladas, explicando qué hacer y por qué

IMPORTANTE: Responde SOLO con el array JSON, sin backticks, sin texto adicional.`;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un experto en gestión de proyectos. Generas listas de tareas estructuradas, accionables y bien priorizadas. SIEMPRE respondes SOLO con JSON válido (array de objetos).',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.4,
                max_tokens: 2000,
            });
            const content = response.choices[0].message.content;
            if (!content) {
                throw new Error('No response from OpenAI');
            }
            let cleanContent = content.replace(/```json|```/g, '').trim();
            const arrayMatch = cleanContent.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
                cleanContent = arrayMatch[0];
            }
            let tasks;
            try {
                tasks = JSON.parse(cleanContent);
            }
            catch (parseError) {
                logger_util_1.Logger.error('Failed to parse AI suggestions as JSON', { content: cleanContent.substring(0, 200) });
                throw new Error('AI generated invalid JSON response. Please try again.');
            }
            if (!Array.isArray(tasks)) {
                throw new Error('AI response is not an array of tasks');
            }
            const validatedTasks = tasks
                .filter((task) => task && task.title && typeof task.title === 'string')
                .map((task) => {
                const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
                return {
                    title: String(task.title).trim(),
                    description: String(task.description || '').trim(),
                    priority: validPriorities.includes(task.priority) ? task.priority : 'MEDIUM',
                    estimatedHours: task.estimatedHours && !isNaN(Number(task.estimatedHours))
                        ? Number(task.estimatedHours)
                        : null,
                };
            });
            if (validatedTasks.length === 0) {
                throw new Error('No valid tasks were generated from AI response');
            }
            logger_util_1.Logger.success(`Generated ${validatedTasks.length} valid task suggestions`);
            return validatedTasks;
        }
        catch (error) {
            logger_util_1.Logger.error('Error suggesting tasks', { error: error.message });
            if (error.status === 401 || error.message?.includes('API key') || error.message?.includes('authentication')) {
                throw new Error('OpenAI API key is invalid or expired. Please check your OPENAI_API_KEY environment variable.');
            }
            if (error.status === 429 || error.message?.includes('rate limit') || error.message?.includes('quota')) {
                throw new Error('OpenAI API rate limit exceeded. Please try again later.');
            }
            if (error.status === 500 || error.status === 503) {
                throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
            }
            if (error instanceof SyntaxError || error.message?.includes('JSON')) {
                throw new Error('AI generated invalid response format. Please try again.');
            }
            throw new Error(`Task suggestion failed: ${error.message || 'Unknown error'}`);
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
            const content = response.choices[0].message.content;
            return content || 'No analysis available';
        }
        catch (error) {
            logger_util_1.Logger.error('Error analyzing input', { error: error.message });
            if (error.status === 401 || error.message?.includes('API key') || error.message?.includes('authentication')) {
                throw new Error('OpenAI API key is invalid or expired. Please check your OPENAI_API_KEY environment variable.');
            }
            if (error.status === 429 || error.message?.includes('rate limit') || error.message?.includes('quota')) {
                throw new Error('OpenAI API rate limit exceeded. Please try again later.');
            }
            throw new Error(`Analysis failed: ${error.message || 'Unknown error'}`);
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=ai.service.js.map