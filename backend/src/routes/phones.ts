import express from 'express';
import db from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// List phones for owner
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const r = await db.query('SELECT phone_id, numero, etiqueta, es_principal FROM owner_phones WHERE owner_id = $1 ORDER BY es_principal DESC', [req.user!.owner_id]);
    res.json(r.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
});

// Add phone
router.post('/', requireAuth,
  body('numero').isNumeric(),
  body('etiqueta').optional().isString(),
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { numero, etiqueta, es_principal } = req.body;
    try {
      if (es_principal) {
        await db.query('UPDATE owner_phones SET es_principal = false WHERE owner_id = $1', [req.user!.owner_id]);
      }
      const r = await db.query(
        'INSERT INTO owner_phones (owner_id, numero, etiqueta, es_principal) VALUES ($1,$2,$3,$4) RETURNING *',
        [req.user!.owner_id, numero, etiqueta || null, !!es_principal]
      );
      res.status(201).json(r.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
  }
);

// Delete phone
router.delete('/:phoneId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const r = await db.query('DELETE FROM owner_phones WHERE phone_id = $1 AND owner_id = $2 RETURNING *', [req.params.phoneId, req.user!.owner_id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
});

export default router;
