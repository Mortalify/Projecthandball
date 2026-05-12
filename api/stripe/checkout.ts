import Stripe from "stripe";

interface CheckoutItem {
  productId: string;
  colorName: string;
  sizeName: string;
  quantity: number;
  name: string;
  price: number;
  image?: string;
}

interface CartMeta {
  p: string;
  c: string;
  s: string;
  q: number;
}

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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY is not set");
    return res.status(500).json({ error: "Stripe is not configured on this server. Add STRIPE_SECRET_KEY to Vercel environment variables." });
  }

  try {
    const body = await parseBody(req);
    const items: CheckoutItem[] = body?.items ?? [];

    if (!items.length) return res.status(400).json({ error: "No items in cart" });

    const stripe = new Stripe(secretKey, { apiVersion: "2025-08-27.basil" as any });

    const proto = (req.headers["x-forwarded-proto"] as string) ?? "https";
    const host = req.headers["host"] as string;
    const baseUrl = `${proto}://${host}`;

    // Store raw cart data — variant ID lookup happens in the webhook after payment
    const cartMeta: CartMeta[] = items.map((item) => ({
      p: item.productId,
      c: item.colorName ?? "",
      s: item.sizeName ?? "",
      q: item.quantity,
    }));

    const line_items = items.map((item) => {
      const isValidImage = item.image?.startsWith("https://");
      return {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: `${item.name}${item.colorName ? ` — ${item.colorName}` : ""}${item.sizeName ? ` / ${item.sizeName}` : ""}`,
            images: isValidImage ? [item.image!] : [],
          },
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "NL", "SE", "NO", "DK"],
      },
      phone_number_collection: { enabled: true },
      metadata: {
        cart_items: JSON.stringify(cartMeta).slice(0, 500),
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    });

    if (!session.url) {
      return res.status(500).json({ error: "Stripe did not return a checkout URL" });
    }

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err.message);
    res.status(500).json({ error: err.message ?? "Failed to start checkout" });
  }
}
