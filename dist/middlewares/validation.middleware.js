"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            res.status(400).json({
                error: 'Validation failed',
                details: error.errors || error.message,
            });
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validation.middleware.js.map