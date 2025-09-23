import express from 'express';
import db from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// List vaccinations for a pet
router.get('/:petId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const petId = req.params.petId;
    const check = await db.query('SELECT pet_id FROM pets WHERE pet_id = $1 AND owner_id = $2', [petId, req.user!.owner_id]);
    if (check.rowCount === 0) return res.status(404).json({ error: 'Pet no encontrado' });
    const r = await db.query('SELECT * FROM pet_vaccinations WHERE pet_id = $1 ORDER BY fecha_aplicacion DESC', [petId]);
    res.json(r.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
});

// Add vaccination
router.post('/:petId', requireAuth,
  body('nombre_vacuna').isString(),
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const petId = req.params.petId;
      const { nombre_vacuna, fecha_aplicacion, vigencia, veterinario } = req.body;
      const check = await db.query('SELECT pet_id FROM pets WHERE pet_id = $1 AND owner_id = $2', [petId, req.user!.owner_id]);
      if (check.rowCount === 0) return res.status(404).json({ error: 'Pet no encontrado' });

      const q = `INSERT INTO pet_vaccinations (pet_id, nombre_vacuna, fecha_aplicacion, vigencia, veterinario)
        VALUES ($1,$2,$3,$4,$5) RETURNING *`;
      const r = await db.query(q, [petId, nombre_vacuna, fecha_aplicacion, vigencia, veterinario]);
      res.status(201).json(r.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
  }
);

// Update and delete vaccination
router.put('/:petId/:vacId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const petId = req.params.petId;
    const vacId = req.params.vacId;
    // ensure pet belongs to owner
    const check = await db.query('SELECT pet_id FROM pets WHERE pet_id = $1 AND owner_id = $2', [petId, req.user!.owner_id]);
    if (check.rowCount === 0) return res.status(404).json({ error: 'Pet no encontrado' });

    const fields = ['nombre_vacuna','fecha_aplicacion','vigencia','veterinario'];
    const sets = [];
    const vals = [];
    let idx = 1;
    for (const f of fields) {
      if (req.body[f] !== undefined) { sets.push(`${f} = $${idx++}`); vals.push(req.body[f]); }
    }
    if (sets.length === 0) return res.status(400).json({ error: 'Nada que actualizar' });
    vals.push(vacId, petId);
    const sql = `UPDATE pet_vaccinations SET ${sets.join(', ')} WHERE vac_id = $${idx++} AND pet_id = $${idx} RETURNING *`;
    const r = await db.query(sql, vals);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Vacunación no encontrada' });
    res.json(r.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
});

router.delete('/:petId/:vacId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const petId = req.params.petId;
    const vacId = req.params.vacId;
    const check = await db.query('SELECT pet_id FROM pets WHERE pet_id = $1 AND owner_id = $2', [petId, req.user!.owner_id]);
    if (check.rowCount === 0) return res.status(404).json({ error: 'Pet no encontrado' });
    const r = await db.query('DELETE FROM pet_vaccinations WHERE vac_id = $1 AND pet_id = $2 RETURNING *', [vacId, petId]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Vacunación no encontrada' });
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
});

export default router;
