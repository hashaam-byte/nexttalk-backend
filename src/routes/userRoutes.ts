import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
}).single('image');

const router = Router();

// Wrap file upload in error handling
const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'File upload error', details: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'Error uploading file', details: err.message });
    }
    next();
  });
};

// Apply middleware to all routes
router.use((req: Request, res: Response, next: NextFunction) => {
  authenticateToken(req, res, next);
});

// Routes with proper typing
router.get('/profile', (req: Request, res: Response, next: NextFunction) => {
  userController.getProfile(req, res).catch(next);
});

router.put('/profile', (req: Request, res: Response, next: NextFunction) => {
  userController.updateProfile(req, res).catch(next);
});

router.post('/profile-image', handleUpload, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userController.uploadProfileImage(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
