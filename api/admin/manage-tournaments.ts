import { verifyToken, getTokenFromRequest, createDbClient, parseBody } from "../_lib/auth-helpers";

async function requireAdmin(req: any, client: any) {
  const token = getTokenFromRequest(req);
  if (!token) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  const payload = verifyToken(token);
  const check = await client.query("SELECT is_admin FROM players WHERE id = $1 LIMIT 1", [payload.id]);
  if (!check.rows[0]?.is_admin) throw Object.assign(new Error("Forbidden"), { status: 403 });
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  let client: ReturnType<typeof createDbClient> | null = null;
  try {
    client = createDbClient();
    await client.connect();
    await requireAdmin(req, client);

    if (req.method === "GET") {
      const result = await client.query(
        `SELECT id, slug, name, date, time, location, borough, type, is_paid, entry_fee, description, max_participants, status
         FROM tournament_events ORDER BY date ASC`
      );
      return res.status(200).json({ tournaments: result.rows });
    }

    if (req.method === "POST") {
      const body = await parseBody(req);
      const { name, date, time, location, borough, type, isPaid, entryFee, description, maxParticipants, status } = body;
      if (!name || !date || !time || !location || !borough) {
        return res.status(400).json({ error: "Name, date, time, location, and borough are required" });
      }
      const slug = slugify(name);
      const result = await client.query(
        `INSERT INTO tournament_events (slug, name, date, time, location, borough, type, is_paid, entry_fee, description, max_participants, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [slug, name, date, time, location, borough, type ?? "singles", isPaid ?? false, entryFee ?? 0, description ?? "", maxParticipants ?? 32, status ?? "upcoming"]
      );
      return res.status(201).json({ tournament: result.rows[0] });
    }

    if (req.method === "PUT") {
      const body = await parseBody(req);
      const { id, name, date, time, location, borough, type, isPaid, entryFee, description, maxParticipants, status } = body;
      if (!id) return res.status(400).json({ error: "id is required" });
      const result = await client.query(
        `UPDATE tournament_events SET name=$1, date=$2, time=$3, location=$4, borough=$5, type=$6, is_paid=$7, entry_fee=$8, description=$9, max_participants=$10, status=$11
         WHERE id=$12 RETURNING *`,
        [name, date, time, location, borough, type, isPaid, entryFee, description, maxParticipants, status, id]
      );
      if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
      return res.status(200).json({ tournament: result.rows[0] });
    }

    if (req.method === "DELETE") {
      const body = await parseBody(req);
      const id = body.id ?? req.query?.id;
      if (!id) return res.status(400).json({ error: "id is required" });
      await client.query("DELETE FROM tournament_events WHERE id = $1", [id]);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    const status = err.status ?? 500;
    return res.status(status).json({ error: err.message ?? "Server error" });
  } finally {
    if (client) await client.end().catch(() => {});
  }
}
