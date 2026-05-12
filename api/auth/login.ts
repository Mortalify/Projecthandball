import bcrypt from "bcryptjs";
import { signToken, createDbClient, parseBody } from "../_lib/auth-helpers";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let client: ReturnType<typeof createDbClient> | null = null;
  try {
    client = createDbClient();
    await client.connect();
    const body = await parseBody(req);
    const { email, password } = body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await client.query(
      "SELECT id, name, email, password_hash, rank, phone, date_of_birth, is_admin FROM players WHERE email = $1 LIMIT 1",
      [email.toLowerCase()],
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const player = result.rows[0];
    const valid = await bcrypt.compare(password, player.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken({ id: player.id, email: player.email, name: player.name, rank: player.rank });

    return res.status(200).json({
      token,
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
        rank: player.rank,
        phone: player.phone,
        dateOfBirth: player.date_of_birth,
        isAdmin: player.is_admin,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err.message);
    return res.status(500).json({ error: err.message ?? "Server error" });
  } finally {
    if (client) await client.end().catch(() => {});
  }
}
