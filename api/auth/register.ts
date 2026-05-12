import bcrypt from "bcryptjs";
import { signToken, createDbClient, parseBody } from "../_lib/auth-helpers";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const client = createDbClient();
  try {
    await client.connect();
    const body = await parseBody(req);
    const { name, email, password, phone, dateOfBirth } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }
    if (name.trim().length < 2) return res.status(400).json({ error: "Name must be at least 2 characters" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Invalid email address" });

    const existing = await client.query(
      "SELECT id FROM players WHERE email = $1 LIMIT 1",
      [email.toLowerCase()],
    );
    if ((existing.rowCount ?? 0) > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await client.query(
      `INSERT INTO players (name, email, password_hash, rank, wins, losses, phone, date_of_birth)
       VALUES ($1, $2, $3, 'unranked', 0, 0, $4, $5)
       RETURNING id, name, email, rank, phone, date_of_birth`,
      [name.trim(), email.toLowerCase(), passwordHash, phone?.trim() || null, dateOfBirth || null],
    );

    const player = result.rows[0];
    const token = signToken({ id: player.id, email: player.email, name: player.name, rank: player.rank });

    return res.status(201).json({
      token,
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
        rank: player.rank,
        phone: player.phone,
        dateOfBirth: player.date_of_birth,
      },
    });
  } catch (err: any) {
    console.error("Register error:", err.message);
    return res.status(500).json({ error: "Server error" });
  } finally {
    await client.end();
  }
}
