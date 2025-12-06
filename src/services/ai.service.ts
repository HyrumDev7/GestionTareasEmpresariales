import OpenAI from 'openai';
import { env } from '../config/env';
import { Logger } from '../utils/logger.util';

/**
 * Servicio de IA para generar tareas con OpenAI GPT
 */
export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  /**
   * Genera una tarea estructurada desde texto natural
   * @param userInput - Texto en lenguaje natural del usuario
   * @param projectId - ID del proyecto (opcional)
   * @returns Datos estructurados de la tarea
   */
  async generateTaskFromText(userInput: string, projectId?: string) {
    try {
      Logger.info('Generating task from AI', { input: userInput });

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
            content:
              'Eres un asistente experto en gestión de proyectos que convierte texto natural en tareas estructuradas. Respondes SOLO con JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Respuestas más consistentes
        max_tokens: 500,
      });

      const content = response.choices[0].message.content;

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Limpiar posibles markdown code blocks
      const cleanContent = content.replace(/```json|```/g, '').trim();

      // Parsear JSON
      const taskData = JSON.parse(cleanContent);

      // Agregar projectId si se proporcionó
      if (projectId) {
        taskData.projectId = projectId;
      }

      Logger.success('Task generated successfully', { taskData });

      return {
        ...taskData,
        aiGenerated: true,
        originalInput: userInput,
      };
    } catch (error: any) {
      Logger.error('Error generating task with AI', { error: error.message });

      if (error.message.includes('API key')) {
        throw new Error('OpenAI API key is invalid or expired');
      }

      if (error instanceof SyntaxError) {
        throw new Error('AI generated invalid response. Please try again.');
      }

      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  /**
   * Sugiere tareas basadas en la descripción de un proyecto
   * @param projectDescription - Descripción del proyecto
   * @param count - Número de tareas a sugerir (default 5)
   */
  async suggestTasksForProject(projectDescription: string, count: number = 5) {
    try {
      Logger.info('Suggesting tasks for project', { description: projectDescription });

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
            content:
              'Eres un experto en gestión de proyectos. Generas listas de tareas estructuradas y accionables.',
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

      Logger.success(`Generated ${tasks.length} task suggestions`);

      return tasks;
    } catch (error: any) {
      Logger.error('Error suggesting tasks', { error: error.message });
      throw new Error(`Task suggestion failed: ${error.message}`);
    }
  }

  /**
   * Analiza el texto y extrae información relevante
   * Útil para debugging
   */
  async analyzeInput(userInput: string) {
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
    } catch (error: any) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }
}
