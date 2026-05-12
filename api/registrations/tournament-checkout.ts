import Stripe from "stripe";
import { verifyToken, getTokenFromRequest, createDbClient } from "../_lib/auth-helpers";

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

async function getPlayerRank(token: string | null): Promise<string> {
  if (!token) return "unranked";
  try {
    const payload = verifyToken(token);
    const client = createDbClient();
    await client.connect();
    try {
      const res = await client.query("SELECT rank FROM players WHERE id = $1 LIMIT 1", [payload.id]);
      return res.rows[0]?.rank ?? "unranked";
    } finally {
      await client.end();
    }
  } catch {
    return "unranked";
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: "Stripe is not configured. Add STRIPE_SECRET_KEY to Vercel environment variables." });
  }

  try {
    const body = await parseBody(req);
    const { tournamentId, tournamentName, entryFee, name, email, phone, partnerName } = body;

    if (!tournamentId || !tournamentName || !entryFee || !name || !email || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const token = getTokenFromRequest(req);
    const rank = await getPlayerRank(token);
    const isSRank = rank === "s";
    const rawFee = Number(entryFee);
    const finalFee = isSRank ? rawFee * 0.8 : rawFee;

    const stripe = new Stripe(secretKey, { apiVersion: "2025-08-27.basil" as any });

    const proto = (req.headers["x-forwarded-proto"] as string) ?? "https";
    const host = req.headers["host"] as string;
    const baseUrl = `${proto}://${host}`;

    const description = partnerName
      ? `Registered: ${name} & ${partnerName}${isSRank ? " · S Rank 20% discount applied" : ""}`
      : `Registered: ${name}${isSRank ? " · S Rank 20% discount applied" : ""}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(finalFee * 100),
            product_data: {
              name: `${tournamentName} — Entry Fee${isSRank ? " (S Rank 20% Off)" : ""}`,
              description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "tournament",
        tournamentId,
        name,
        email,
        phone,
        partnerName: partnerName ?? "",
        sRankDiscount: isSRank ? "true" : "false",
      },
      success_url: `${baseUrl}/tournaments?registered=1`,
      cancel_url: `${baseUrl}/tournaments`,
    });

    if (!session.url) {
      return res.status(500).json({ error: "Stripe did not return a checkout URL" });
    }

    res.status(200).json({ url: session.url, discountApplied: isSRank });
  } catch (err: any) {
    console.error("Tournament checkout error:", err.message);
    res.status(500).json({ error: err.message ?? "Failed to start checkout" });
  }
}
