/**
 * Utilidades para manejo de fechas
 */
export class DateUtil {
  /**
   * Verifica si una fecha es válida
   */
  static isValid(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Convierte string a Date
   */
  static parse(dateString: string): Date | null {
    try {
      const date = new Date(dateString);
      return this.isValid(date) ? date : null;
    } catch {
      return null;
    }
  }

  /**
   * Verifica si una fecha ya pasó
   */
  static isPast(date: Date): boolean {
    return date < new Date();
  }

  /**
   * Verifica si una fecha está en el futuro
   */
  static isFuture(date: Date): boolean {
    return date > new Date();
  }

  /**
   * Formatea fecha a ISO string
   */
  static toISO(date: Date): string {
    return date.toISOString();
  }

  /**
   * Obtiene fecha de hoy a las 00:00:00
   */
  static today(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  /**
   * Agrega días a una fecha
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Calcula diferencia en días entre dos fechas
   */
  static daysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
