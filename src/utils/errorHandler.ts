import { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const handleAsync = (fn: AsyncRequestHandler) => {
  return (_req: Request, res: Response, _next: NextFunction) => {
    Promise.resolve(fn(_req, res, _next)).catch((error) => {
      res.status(500).json({ error: error.message });
    });
  };
};
