import express from 'express';
import db from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// List pets for owner
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const r = await db.query('SELECT * FROM pets WHERE owner_id = $1 ORDER BY nombre', [req.user!.owner_id]);
    res.json(r.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
});

// Create pet
router.post('/', requireAuth,
  body('nombre').isString(),
  body('especie').isString(),
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { nombre, especie, raza, tamano, peso_kg, fecha_nacimiento, sexo, tipo_pelo, numero_chip, tipo_chip, notas_adicionales } = req.body;
    console.log("Estoy entrando aqui")
    try {
      const q = `INSERT INTO pets (owner_id, nombre, especie, raza, tamano, peso_kg, fecha_nacimiento, sexo, tipo_pelo, numero_chip, tipo_chip, notas_adicionales)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`;
      const r = await db.query(q, [req.user!.owner_id, nombre, especie, raza, tamano, peso_kg, fecha_nacimiento, sexo, tipo_pelo, numero_chip, tipo_chip, notas_adicionales]);
      res.status(201).json(r.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
  }
);

// Get, update, delete pet by id (ensure owner)
router.get('/:petId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const q = 'SELECT * FROM pets WHERE pet_id = $1 AND owner_id = $2';
    const r = await db.query(q, [req.params.petId, req.user!.owner_id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(r.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
});

router.put('/:petId', requireAuth, async (req: AuthRequest, res) => {
  const updatable = ['nombre','especie','raza','tamano','peso_kg','fecha_nacimiento','sexo','tipo_pelo','numero_chip','tipo_chip','notas_adicionales'];
  const sets: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const f of updatable) {
    if (req.body[f] !== undefined) { sets.push(`${f} = $${idx++}`); values.push(req.body[f]); }
  }
  if (sets.length === 0) return res.status(400).json({ error: 'Nada que actualizar' });
  values.push(req.params.petId, req.user!.owner_id);
  const sql = `UPDATE pets SET ${sets.join(', ')} WHERE pet_id = $${idx++} AND owner_id = $${idx} RETURNING *`;
  try {
    const r = await db.query(sql, values);
    if (r.rowCount === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(r.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
});

router.delete('/:petId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const r = await db.query('DELETE FROM pets WHERE pet_id = $1 AND owner_id = $2 RETURNING *', [req.params.petId, req.user!.owner_id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
});

export default router;
