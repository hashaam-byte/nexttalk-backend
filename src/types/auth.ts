import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  name: string;
  profileImage: string | null;
  generation?: string;
  phone?: string | null;
  bio?: string | null;
}

export interface AuthRequest extends Request {
  user?: User;
}
