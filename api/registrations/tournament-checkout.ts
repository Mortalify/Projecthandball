import Stripe from "stripe";

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

    const stripe = new Stripe(secretKey, { apiVersion: "2025-08-27.basil" as any });

    const proto = (req.headers["x-forwarded-proto"] as string) ?? "https";
    const host = req.headers["host"] as string;
    const baseUrl = `${proto}://${host}`;

    const description = partnerName
      ? `Registered: ${name} & ${partnerName}`
      : `Registered: ${name}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(Number(entryFee) * 100),
            product_data: {
              name: `${tournamentName} — Entry Fee`,
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
      },
      success_url: `${baseUrl}/tournaments?registered=1`,
      cancel_url: `${baseUrl}/tournaments`,
    });

    if (!session.url) {
      return res.status(500).json({ error: "Stripe did not return a checkout URL" });
    }

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("Tournament checkout error:", err.message);
    res.status(500).json({ error: err.message ?? "Failed to start checkout" });
  }
}
