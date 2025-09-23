import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});

const upload = multer({ storage });

/**
 * Upload document for pet (multipart/form-data field: file)
 */
router.post('/:petId/upload', requireAuth, upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) return res.status(400).json({ error: 'File required (field: file)' });
  const petId = req.params.petId;
  try {
    // verify pet belongs to owner
    const petCheck = await db.query('SELECT pet_id FROM pets WHERE pet_id = $1 AND owner_id = $2', [petId, req.user!.owner_id]);
    if (petCheck.rowCount === 0) {
      // remove file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Pet no encontrado' });
    }
    const q = `INSERT INTO pet_documents (pet_id, tipo_doc, nombre_archivo, ruta_archivo)
      VALUES ($1,$2,$3,$4) RETURNING *`;
    const r = await db.query(q, [petId, req.body.tipo_doc || null, req.file.originalname, req.file.path]);
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// List documents for pet
router.get('/:petId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const petId = req.params.petId;
    const check = await db.query('SELECT pet_id FROM pets WHERE pet_id = $1 AND owner_id = $2', [petId, req.user!.owner_id]);
    if (check.rowCount === 0) return res.status(404).json({ error: 'Pet no encontrado' });
    const r = await db.query('SELECT doc_id, tipo_doc, nombre_archivo, ruta_archivo FROM pet_documents WHERE pet_id = $1', [petId]);
    res.json(r.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
});

// Download document (sends file)
router.get('/download/:docId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const r = await db.query(
      `SELECT pd.ruta_archivo, p.owner_id FROM pet_documents pd JOIN pets p ON pd.pet_id = p.pet_id WHERE pd.doc_id = $1`, [req.params.docId]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'Documento no encontrado' });
    const row = r.rows[0];
    if (row.owner_id !== req.user!.owner_id) return res.status(403).json({ error: 'No autorizado' });
    const filePath = row.ruta_archivo;
    res.sendFile(path.resolve(filePath));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
});

export default router;
