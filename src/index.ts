import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
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

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Error handling for multer
const multerErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      error: 'File upload error',
      details: err.message
    });
    return;
  }
  next(err);
};

// Global error handler
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
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
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
