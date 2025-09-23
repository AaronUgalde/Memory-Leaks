// backend/src/routes/get_user_by_id.ts
import express, { Request, Response, Router} from 'express';
import db from '../db';


const router = Router();


/**
 * GET /users/:id
 * Devuelve un usuario por id (público)
 */
router.get('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT id, username, display_name, bio, profile_image_url, website_url,
             user_type, organization_type, verification_status, allow_donations
      FROM users
      WHERE id = $1 AND is_active = TRUE
      LIMIT 1;
    `;
    const result = await db.query(sql, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (err: any) {
    console.error('GET /users/:id error', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
