import express, { Request, Response, ErrorRequestHandler } from 'express';
import { corsMiddleware } from './middleware/cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Apply CORS middleware first
app.use(corsMiddleware);

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (_req, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Error handling for multer
const multerErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      error: 'File upload error',
      details: err.message
    });
    return;
  }
  _next(err);
};

// Global error handler
const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// Apply error handlers
app.use(multerErrorHandler);
app.use(globalErrorHandler);

// Not found handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
