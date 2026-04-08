import { Router } from "express";
import { pool } from "../db/pool.js";
import { verifyJwt } from "../auth/verifyJwt.js";
import { TBL_USERS, TBL_ROLES, TBL_USER_ROLES } from "../db/tables.js";

const router = Router();

router.post("/init", verifyJwt, async (req, res) => {
  try {
    const claims = req.user || {};
    const oid = claims.oid || claims.sub;
    const email = claims.preferred_username || claims.email || null;
    const fullName = claims.name || null;

    if (!oid || !email) {
      return res.status(400).json({ error: "Klaida: JWT žetone trūksta oid arba el. pašto" });
    }

    // upsert user
    const upsertUserSQL = `
      INSERT INTO ${TBL_USERS} (oid, email, full_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (oid) DO
        UPDATE SET email = EXCLUDED.email,
                   full_name = COALESCE(EXCLUDED.full_name, ${TBL_USERS}.full_name),
                   last_login_at = NOW()
      RETURNING oid, email, full_name, created_at, last_login_at;
    `;
    const { rows: [user] } = await pool.query(upsertUserSQL, [oid, email, fullName]);

    // fetch roles 
    const rolesSQL = `
      SELECT r.id, r.name
      FROM ${TBL_USER_ROLES} ur
      JOIN ${TBL_ROLES} r ON r.id = ur.role_id
      WHERE ur.user_oid = $1
      ORDER BY r.name;
    `;
    let { rows: roles } = await pool.query(rolesSQL, [oid]);

    // auto-assign "Darbuotojas"
    if (roles.length === 0) {
      const { rows: employeeRows } = await pool.query(
        `SELECT id FROM ${TBL_ROLES} WHERE name = $1`,
        ["Darbuotojas"]
      );

      if (employeeRows.length === 0) {
        console.error('Klaida: rolė "Darbuotojas" nerasta');
      } else {
        const employeeRoleId = employeeRows[0].id;

        // insert
        await pool.query(
          `
          INSERT INTO ${TBL_USER_ROLES} (user_oid, role_id, assigned_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT DO NOTHING
          `,
          [oid, employeeRoleId]
        );

        // re-fetch roles
        const { rows: refreshed } = await pool.query(rolesSQL, [oid]);
        roles = refreshed;
      }
    }

    return res.json({ user, roles });
  } catch (e) {
    console.error("session/init error:", e);
    return res.status(500).json({ error: "internal error" });
  }
});

export default router;
