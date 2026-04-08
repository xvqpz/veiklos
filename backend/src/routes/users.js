import { Router } from 'express';
import { pool } from '../db/pool.js';
import { TBL_USERS } from '../db/tables.js';

const router = Router();

// GET /api/users
router.get('/', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, email, full_name, created_at FROM ${TBL_USERS} ORDER BY id DESC`
  );
  res.json(rows);
});

// POST /api/users
router.post('/', async (req, res) => {
  const { email, full_name } = req.body;
  if (!email || !full_name) return res.status(400).json({ error: 'Klaida: Vartotojo el. paštas ir rolė yra privalomi' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO ${TBL_USERS} (email, full_name) VALUES ($1, $2)
       RETURNING id, email, full_name, created_at`,
      [email, full_name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Klaida. Vartotojo el. paštas jau egzistuoja' });
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

export default router;
