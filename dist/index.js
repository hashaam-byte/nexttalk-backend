"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = require("./middleware/cors");
const body_parser_1 = __importDefault(require("body-parser"));
const multer_1 = __importDefault(require("multer"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use(cors_1.corsMiddleware);
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use('/auth', authRoutes_1.default);
app.use('/user', userRoutes_1.default);
const multerErrorHandler = (err, _req, res, _next) => {
    if (err instanceof multer_1.default.MulterError) {
        res.status(400).json({
            error: 'File upload error',
            details: err.message
        });
        return;
    }
    _next(err);
};
const globalErrorHandler = (err, _req, res, _next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};
app.use(multerErrorHandler);
app.use(globalErrorHandler);
app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map