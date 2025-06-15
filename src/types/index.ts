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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  generation?: string | null;
}

export interface JwtPayload {
  id: string;
  email: string;
}

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  generation: string;
  profileImage?: string | null;
  phone?: string | null;
  bio?: string | null;
}
