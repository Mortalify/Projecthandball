import { createDbClient, parseBody } from "../_lib/auth-helpers";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let client: ReturnType<typeof createDbClient> | null = null;
  try {
    const body = await parseBody(req);
    const { email } = body;

    if (!email?.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    client = createDbClient();
    await client.connect();

    await client.query(
      `CREATE TABLE IF NOT EXISTS password_reset_requests (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )`,
    );

    const playerRes = await client.query(
      "SELECT id, name, email FROM players WHERE email = $1 LIMIT 1",
      [email.toLowerCase()],
    );

    if (playerRes.rowCount === 0) {
      return res.status(200).json({ ok: true });
    }

    const player = playerRes.rows[0];

    await client.query(
      `INSERT INTO password_reset_requests (email, name, status)
       VALUES ($1, $2, 'pending')`,
      [player.email, player.name],
    );

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("Forgot password error:", err.message);
    return res.status(500).json({ error: err.message ?? "Server error" });
  } finally {
    if (client) await client.end().catch(() => {});
  }
}
