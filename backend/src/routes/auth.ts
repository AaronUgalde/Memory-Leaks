// src/routes/auth.ts
import express, { Request, Response } from 'express';
import db from '../db';
import { hashPassword, comparePassword } from '../utils/hash';
import { requireAuth, AuthRequest } from '../middleware/auth';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';

dotenv.config();
const router = express.Router();

function getJwtSecret(): jwt.Secret {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no definido en .env');
  return secret as jwt.Secret;
}

const rawExpires = process.env.JWT_EXPIRES_IN;
let expiresInValue: jwt.SignOptions['expiresIn'] = rawExpires
  ? (Number.isFinite(Number(rawExpires))
      ? Number(rawExpires)
      : (rawExpires as jwt.SignOptions['expiresIn']))
  : '7d';

const signOptions: jwt.SignOptions = { expiresIn: expiresInValue };

function getCookieMaxAgeMs(remember?: boolean) {
  return remember ? 30 * 24 * 60 * 60 * 1000 : undefined;
}

/**
 * REGISTER
 */
router.post(
  '/register',
  [
    body('username').isLength({ min: 3 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('user_type').isIn(['individual', 'organization']),
    body('display_name').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      username,
      email,
      password,
      user_type,
      display_name,
      organization_type,
      verification_status,
      remember,
    } = req.body;

    try {
      await db.query('BEGIN');

      const pwHash = await hashPassword(password);

      const insertQuery = `
        INSERT INTO users (
          username, email, password_hash, user_type,
          display_name, organization_type, verification_status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING id, username, email, user_type, display_name, organization_type, verification_status;
      `;

      const values = [
        username,
        email,
        pwHash,
        user_type,
        display_name,
        user_type === 'organization' ? organization_type : null,
        user_type === 'organization' ? verification_status || 'pending' : null,
      ];

      const result = await db.query(insertQuery, values);
      const user = result.rows[0];

      // generar token
      const payload = { user_id: user.id, user_type: user.user_type };
      const token = jwt.sign(payload, getJwtSecret(), signOptions);

      const maxAge = getCookieMaxAgeMs(remember);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        ...(maxAge ? { maxAge } : {}),
      });

      await db.query('COMMIT');
      res.status(201).json({ user });
    } catch (err: any) {
      await db.query('ROLLBACK');
      if (err?.code === '23505')
        return res.status(400).json({ error: 'Usuario o email ya registrado' });
      console.error(err);
      res.status(500).json({ error: 'Error del servidor' });
    }
  }
);

/**
 * LOGIN
 */
router.post(
  '/login',
  [body('email').isEmail(), body('password').isLength({ min: 1 })],
  async (req: Request, res: Response) => {
    const { email, password, remember } = req.body;
    try {
      const q = 'SELECT id, username, email, password_hash, user_type, display_name FROM users WHERE email = $1';
      const r = await db.query(q, [email]);
      if (r.rowCount === 0)
        return res.status(400).json({ error: 'Credenciales inválidas' });

      const user = r.rows[0];
      const ok = await comparePassword(password, user.password_hash);
      if (!ok) return res.status(400).json({ error: 'Credenciales inválidas' });

      const payload = { user_id: user.id, user_type: user.user_type };
      const token = jwt.sign(payload, getJwtSecret(), signOptions);
      const maxAge = getCookieMaxAgeMs(remember);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        ...(maxAge ? { maxAge } : {}),
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          user_type: user.user_type,
          display_name: user.display_name,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error del servidor' });
    }
  }
);

/**
 * LOGOUT
 */
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ ok: true });
});

/**
 * /me
 */
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const q = 'SELECT id, username, email, user_type, display_name, organization_type, verification_status FROM users WHERE id = $1';
    const r = await db.query(q, [userId]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ user: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
