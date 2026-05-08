import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, playersTable, registerSchema, loginSchema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/require-auth.js";

const router: IRouter = Router();

function signToken(payload: { id: number; email: string; name: string; rank: string }) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET not set");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }

  const { name, email, password } = parsed.data;

  const existing = await db.select().from(playersTable).where(eq(playersTable.email, email.toLowerCase())).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [player] = await db.insert(playersTable).values({
    name,
    email: email.toLowerCase(),
    passwordHash,
    rank: "unranked",
    wins: 0,
    losses: 0,
  }).returning();

  if (!player) {
    res.status(500).json({ error: "Failed to create account" });
    return;
  }

  const token = signToken({ id: player.id, email: player.email, name: player.name, rank: player.rank });
  req.log.info({ playerId: player.id }, "Player registered");
  res.status(201).json({ token, player: { id: player.id, name: player.name, email: player.email, rank: player.rank } });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }

  const { email, password } = parsed.data;
  const [player] = await db.select().from(playersTable).where(eq(playersTable.email, email.toLowerCase())).limit(1);

  if (!player) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, player.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ id: player.id, email: player.email, name: player.name, rank: player.rank });
  req.log.info({ playerId: player.id }, "Player logged in");
  res.json({ token, player: { id: player.id, name: player.name, email: player.email, rank: player.rank } });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [player] = await db.select({
    id: playersTable.id,
    name: playersTable.name,
    email: playersTable.email,
    rank: playersTable.rank,
    wins: playersTable.wins,
    losses: playersTable.losses,
    createdAt: playersTable.createdAt,
  }).from(playersTable).where(eq(playersTable.id, req.player!.id)).limit(1);

  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  res.json({ player });
});

export default router;
