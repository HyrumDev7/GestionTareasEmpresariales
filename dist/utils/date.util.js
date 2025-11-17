"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtil = void 0;
class DateUtil {
    static isValid(date) {
        return date instanceof Date && !isNaN(date.getTime());
    }
    static parse(dateString) {
        try {
            const date = new Date(dateString);
            return this.isValid(date) ? date : null;
        }
        catch {
            return null;
        }
    }
    static isPast(date) {
        return date < new Date();
    }
    static isFuture(date) {
        return date > new Date();
    }
    static toISO(date) {
        return date.toISOString();
    }
    static today() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    static addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    static daysDifference(date1, date2) {
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}
exports.DateUtil = DateUtil;
//# sourceMappingURL=date.util.js.map