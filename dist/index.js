"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const multer_1 = __importDefault(require("multer"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'https://nexttalk-backend.railway.internal'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.get('/', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
app.use('/auth', authRoutes_1.default);
app.use('/user', userRoutes_1.default);
app.use('/health', healthRoutes_1.default);
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