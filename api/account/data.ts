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

    const [playerRes, tournamentRes, clinicRes] = await Promise.all([
      client.query(
        "SELECT id, name, email, rank, phone, date_of_birth, wins, losses, created_at FROM players WHERE id = $1 LIMIT 1",
        [payload.id],
      ),
      client.query(
        "SELECT id, tournament_id, name, email, phone, partner_name, is_paid_tournament, created_at FROM registrations WHERE email = $1 ORDER BY created_at DESC",
        [payload.email],
      ),
      client.query(
        "SELECT id, clinic_id, name, email, phone, age, guardian_name, waiver_accepted, created_at FROM clinic_registrations WHERE email = $1 ORDER BY created_at DESC",
        [payload.email],
      ),
    ]);

    if (playerRes.rowCount === 0) return res.status(404).json({ error: "User not found" });

    const player = playerRes.rows[0];

    return res.status(200).json({
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
        rank: player.rank,
        phone: player.phone,
        dateOfBirth: player.date_of_birth,
        wins: player.wins,
        losses: player.losses,
        memberSince: player.created_at,
      },
      tournamentRegistrations: tournamentRes.rows,
      clinicRegistrations: clinicRes.rows,
    });
  } catch (err: any) {
    console.error("Account data error:", err.message);
    return res.status(500).json({ error: err.message ?? "Server error" });
  } finally {
    if (client) await client.end().catch(() => {});
  }
}
