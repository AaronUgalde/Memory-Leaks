import express from 'express';
import db from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get profile (owner)
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const q = `SELECT owner_id, email, nombre, apellido_paterno, apellido_materno, tipo_domicilio, calle,
      colonia, ciudad, estado, codigo_postal, numero_exterior, numero_interior, role
      FROM owners WHERE owner_id = $1`;
    const r = await db.query(q, [req.user!.owner_id]);
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Update profile
router.put('/me', requireAuth,
  body('nombre').optional().isString(),
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const ownerId = req.user!.owner_id;
    const fields = [
      'nombre', 'apellido_paterno', 'apellido_materno', 'tipo_domicilio', 'calle', 'colonia',
      'ciudad', 'estado', 'codigo_postal', 'numero_exterior', 'numero_interior'
    ];
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = $${idx++}`);
        values.push(req.body[f]);
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'Nada que actualizar' });
    values.push(ownerId);
    const sql = `UPDATE owners SET ${updates.join(', ')} WHERE owner_id = $${idx} RETURNING owner_id, email, nombre, apellido_paterno, apellido_materno`;
    try {
      const r = await db.query(sql, values);
      res.json(r.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error del servidor' });
    }
  }
);

export default router;
