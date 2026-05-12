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
    const body = await parseBody(req);
    const { passcode } = body;

    const adminPasscode = process.env.ADMIN_PASSCODE;
    if (!adminPasscode) return res.status(500).json({ error: "Admin not configured" });
    if (!passcode || passcode !== adminPasscode) {
      return res.status(403).json({ error: "Incorrect admin passcode" });
    }

    client = createDbClient();
    await client.connect();
    await client.query("UPDATE players SET is_admin = true WHERE id = $1", [payload.id]);
    const result = await client.query(
      "SELECT id, name, email, rank, phone, date_of_birth, is_admin FROM players WHERE id = $1 LIMIT 1",
      [payload.id],
    );
    const player = result.rows[0];
    return res.status(200).json({
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
    return res.status(500).json({ error: err.message ?? "Server error" });
  } finally {
    if (client) await client.end().catch(() => {});
  }
}
