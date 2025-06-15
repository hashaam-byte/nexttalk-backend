import { Router, Response, NextFunction, RequestHandler } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../types/auth';
import * as userController from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
}).single('image');

const router = Router();

const handleUpload: RequestHandler = (req, res, next) => {
  upload(req as any, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: 'File upload error', details: err.message });
      return;
    } 
    if (err) {
      res.status(500).json({ error: 'Error uploading file', details: err.message });
      return;
    }
    next();
  });
};

// Fix middleware and route handler typing
router.use(((req: AuthRequest, res: Response, next: NextFunction) => {
  authenticateToken(req, res, next);
}) as RequestHandler);

router.post('/profile-image', 
  handleUpload,
  ((req: AuthRequest, res: Response, next: NextFunction) => {
    userController.uploadProfileImage(req, res).catch(next);
  }) as RequestHandler
);

export default router;
