import { env } from '../config/env';

/**
 * Logger simple para la aplicación
 * Mejora el debugging y monitoreo
 */
export class Logger {
  private static formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  static info(message: string, meta?: any): void {
    if (env.IS_DEVELOPMENT) {
      console.log(this.formatMessage('INFO', message, meta));
    }
  }

  static error(message: string, error?: any): void {
    console.error(this.formatMessage('ERROR', message, error));
  }

  static warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('WARN', message, meta));
  }

  static debug(message: string, meta?: any): void {
    if (env.IS_DEVELOPMENT) {
      console.debug(this.formatMessage('DEBUG', message, meta));
    }
  }

  static success(message: string, meta?: any): void {
    if (env.IS_DEVELOPMENT) {
      console.log(this.formatMessage('SUCCESS', message, meta));
    }
  }
}
