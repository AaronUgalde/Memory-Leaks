


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

//TODO: Hacer una funcion para agregar wallet adress a un usuario

router.post('/', requireAuth,
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { wallet_addres, label } = req.body;
    console.log("Estoy entrando aqui")
    try {
      const q = `INSERT INTO wallets (user_id, wallet_addres, label)
      VALUES ($1,$2, $3) RETURNING *`;
      const r = await db.query(q, [req.user!.user_id, wallet_addres, label]);
      res.status(201).json(r.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
  }
);




export default router;
