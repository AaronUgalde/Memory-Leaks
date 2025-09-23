

//TODO: Hacer una funcion para agregar wallet adress a un usuario

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

/**
 * Get donations by me or do it for me
 */

//TODO: Hacer la funcion de obtener transacciones por usuario (id_usuario)

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const q = 'SELECT * FROM donations WHERE donor_id = $1 OR recipient_id = $1';
    const r = await db.query(q, [req.user!.user_id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(r.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
});


//TODO: Hacer una funcion para realizar la transaccion (necesita usuario identificado)
    //TODO: Hacer una funcion para pedir autorizar la transaccion



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
