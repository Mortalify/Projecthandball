import { verifyToken, getTokenFromRequest, createDbClient } from "../_lib/auth-helpers";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  let payload: ReturnType<typeof verifyToken>;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  let client: ReturnType<typeof createDbClient> | null = null;
  try {
    client = createDbClient();
    await client.connect();

    const adminCheck = await client.query(
      "SELECT is_admin FROM players WHERE id = $1 LIMIT 1",
      [payload.id],
    );
    if (!adminCheck.rows[0]?.is_admin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await client.query(
      `CREATE TABLE IF NOT EXISTS password_reset_requests (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )`,
    );

    const result = await client.query(
      `SELECT id, email, name, status, created_at
       FROM password_reset_requests
       ORDER BY created_at DESC`,
    );

    return res.status(200).json({ requests: result.rows });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? "Server error" });
  } finally {
    if (client) await client.end().catch(() => {});
  }
}
