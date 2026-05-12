import { Client } from "pg";

async function parseBody(req: any): Promise<any> {
  if (req.body !== undefined && req.body !== null) {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString();
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Database not configured" });

  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();

    if (req.method === "GET") {
      const clinicId = req.query?.clinicId as string;
      if (!clinicId) return res.status(400).json({ error: "clinicId required" });
      const result = await client.query(
        "SELECT COUNT(*) as count FROM clinic_registrations WHERE clinic_id = $1",
        [clinicId],
      );
      return res.status(200).json({ count: Number(result.rows[0]?.count ?? 0) });
    }

    if (req.method === "POST") {
      const body = await parseBody(req);
      const { clinicId, name, email, phone, age, guardianName, waiverAccepted } = body;

      if (!clinicId || !name || !email || !phone || age === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const ageNum = Number(age);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        return res.status(400).json({ error: "Invalid age" });
      }

      if (ageNum < 18 && !waiverAccepted) {
        return res.status(400).json({ error: "Parental waiver must be accepted for participants under 18" });
      }

      if (ageNum < 18 && !guardianName?.trim()) {
        return res.status(400).json({ error: "Guardian name is required for participants under 18" });
      }

      const existing = await client.query(
        "SELECT id FROM clinic_registrations WHERE clinic_id = $1 AND email = $2 LIMIT 1",
        [clinicId, email.toLowerCase()],
      );
      if ((existing.rowCount ?? 0) > 0) {
        return res.status(409).json({ error: "You are already registered for this clinic" });
      }

      await client.query(
        `INSERT INTO clinic_registrations (clinic_id, name, email, phone, age, guardian_name, waiver_accepted)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          clinicId,
          name,
          email.toLowerCase(),
          phone,
          ageNum,
          guardianName?.trim() || null,
          ageNum < 18 ? Boolean(waiverAccepted) : false,
        ],
      );

      return res.status(201).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("Clinic registration error:", err.message);
    return res.status(500).json({ error: err.message ?? "Server error" });
  } finally {
    await client.end();
  }
}
