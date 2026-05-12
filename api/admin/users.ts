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

  const client = createDbClient();
  try {
    await client.connect();

    const adminCheck = await client.query(
      "SELECT is_admin FROM players WHERE id = $1 LIMIT 1",
      [payload.id],
    );
    if (!adminCheck.rows[0]?.is_admin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const result = await client.query(
      `SELECT id, name, email, rank, wins, losses, phone, is_admin, created_at
       FROM players
       ORDER BY created_at DESC`,
    );

    return res.status(200).json({ users: result.rows });
  } catch (err: any) {
    return res.status(500).json({ error: "Server error" });
  } finally {
    await client.end();
  }
}
