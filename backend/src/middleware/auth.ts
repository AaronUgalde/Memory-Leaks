import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export interface AuthRequest extends Request {
  user?: { user_id: string; user_type: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    req.user = { user_id: payload.user_id, user_type: payload.user_type };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'No auth' });
  if (req.user.user_type !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}
