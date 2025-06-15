import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};
