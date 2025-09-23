// routes/usersSearch.ts
import { Router, Request, Response } from 'express';
import db from '../db';
import { query, validationResult } from 'express-validator';

const router = Router();

/**
 * GET /usersSearch/searchProfile?q=texto
 * Devuelve todos los usuarios si no hay query, o filtra si hay query
 */
router.get(
  '/searchProfile',
  [ 
    query('q').optional().trim() // Hacer el parámetro opcional
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const q = String(req.query.q || '').trim(); // Obtener query o string vacío
    
    try {
      let sql: string;
      let params: any[];
      
      if (q === '') {
        // Si no hay búsqueda, devolver todos los usuarios activos
        sql = `
          SELECT id, username, display_name, profile_image_url, bio
          FROM users
          WHERE is_active = TRUE
          ORDER BY username
          LIMIT 20;
        `;
        params = [];
      } else {
        // Si hay búsqueda, filtrar por username o display_name
        const like = `%${q.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
        sql = `
          SELECT id, username, display_name, profile_image_url, bio
          FROM users
          WHERE is_active = TRUE
            AND (username ILIKE $1 OR display_name ILIKE $1)
          ORDER BY username
          LIMIT 20;
        `;
        params = [like];
      }
      
      const result = await db.query(sql, params);
      const rows = result.rows.map((r: any) => ({
        id: r.id,
        username: r.username,
        display_name: r.display_name,
        profile_image_url: r.profile_image_url,
        bio: r.bio
      }));
      
      return res.json({ results: rows });
    } catch (err: any) {
      console.error('GET /searchProfile error', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;