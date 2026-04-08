import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import usersRouter from './routes/users.js';
import rolesRouter from './routes/roles.js';
import userRolesRouter from "./routes/userRoles.js";
import sessionRouter from './routes/session.js';
import themesRouter from "./routes/themes.js";
import activitiesRouter from "./routes/activities.js";

import { verifyJwt } from './auth/verifyJwt.js';
import { attachRoles } from './auth/attachRoles.js';

dotenv.config();

const app = express();

//test
app.use((req, _res, next) => {
  console.log("BACKEND RECEIVED:", req.method, req.url);
  next();
});

app.use(cors());
app.use(express.json());

const uploadDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadDir));

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// /api/me —  return ALL roles
app.get("/api/me", verifyJwt, attachRoles, (req, res) => {
  console.log("HIT /api/me route handler");

  const { name, email, oid } = req.user;
  const roles = req.user.roles || [];

  console.log("/api/me returning:", { name, email, oid, roles });

  res.json({ name, email, oid, roles });
});
;

// Users API
app.use('/api/users', verifyJwt, usersRouter);
app.use('/api/session', sessionRouter);
app.use('/api/roles', rolesRouter);
app.use("/api/user-roles", userRolesRouter);
app.use("/api/themes", themesRouter);
app.use("/api/activities", activitiesRouter);

const port = process.env.PORT || 4000;
app.listen(port, "0.0.0.0", () => {
  console.log(`API listening on port ${port}`);
});
