import { pool } from "../db/pool.js";

export async function attachRoles(req, res, next) {
  try {
    const oid = req.user?.oid || req.user?.sub;

    if (!oid) {
      req.user.roles = [];
      return next();
    }

    // check employee role
    const roleRes = await pool.query(
      `SELECT id FROM roles WHERE name = $1`,
      ["Darbuotojas"]
    );

    if (roleRes.rowCount === 0) {
      // console.error('attachRoles: "Darbuotojas" role not found');
      req.user.roles = [];
      return next();
    }

    const employeeRoleId = roleRes.rows[0].id;

    // always insert employee role
    const insertRes = await pool.query(
      `
      INSERT INTO user_roles (user_oid, role_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [oid, employeeRoleId]
    );

    // load all roles
    const rolesRes = await pool.query(
      `
      SELECT r.name
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_oid = $1
      ORDER BY r.name
      `,
      [oid]
    );

    req.user.roles = rolesRes.rows.map(r => r.name);

    return next();
  } catch (err) {
      console.error("attachRoles error:", err);
      req.user.roles = [];
      return next();
  }
}
