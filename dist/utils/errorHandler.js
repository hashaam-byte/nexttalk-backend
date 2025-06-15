"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAsync = void 0;
const handleAsync = (fn) => {
    return (_req, res, _next) => {
        Promise.resolve(fn(_req, res, _next)).catch((error) => {
            res.status(500).json({ error: error.message });
        });
    };
};
exports.handleAsync = handleAsync;
//# sourceMappingURL=errorHandler.js.map