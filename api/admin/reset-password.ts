import bcrypt from "bcryptjs";
import { verifyToken, getTokenFromRequest, createDbClient, parseBody } from "../_lib/auth-helpers";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

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

    const body = await parseBody(req);
    const { requestId, email, newPassword } = body;

    if (!email || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Email and a password of at least 6 characters are required" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await client.query(
      "UPDATE players SET password_hash = $1 WHERE email = $2",
      [passwordHash, email.toLowerCase()],
    );

    if (requestId) {
      await client.query(
        "UPDATE password_reset_requests SET status = 'resolved' WHERE id = $1",
        [requestId],
      );
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? "Server error" });
  } finally {
    if (client) await client.end().catch(() => {});
  }
}
