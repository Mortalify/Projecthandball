import Stripe from "stripe";

const PRINTIFY_API = "https://api.printify.com/v1";

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
  v: number;
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

async function findVariantId(
  apiKey: string,
  shopId: string,
  productId: string,
  colorName: string,
  sizeName: string,
): Promise<number | null> {
  try {
    const res = await fetch(`${PRINTIFY_API}/shops/${shopId}/products/${productId}.json`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return null;
    const product = await res.json() as any;
    const colorOption = product.options?.find((o: any) => o.name === "Colors");
    const sizeOption = product.options?.find((o: any) => o.name === "Sizes");
    const colorValue = colorOption?.values?.find(
      (v: any) => v.title.toLowerCase() === colorName.toLowerCase(),
    );
    const sizeValue = sizeOption?.values?.find(
      (v: any) => v.title.toLowerCase() === sizeName.toLowerCase(),
    );
    if (!colorValue && !sizeValue) return null;
    const variant = product.variants?.find((v: any) => {
      if (!v.is_enabled) return false;
      const hasColor = colorValue ? v.options.includes(colorValue.id) : true;
      const hasSize = sizeValue ? v.options.includes(sizeValue.id) : true;
      return hasColor && hasSize;
    });
    return variant?.id ?? null;
  } catch {
    return null;
  }
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

  const printifyKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;

  try {
    const body = await parseBody(req);
    const items: CheckoutItem[] = body?.items ?? [];

    if (!items.length) return res.status(400).json({ error: "No items in cart" });

    const stripe = new Stripe(secretKey, { apiVersion: "2025-08-27.basil" as any });

    const proto = (req.headers["x-forwarded-proto"] as string) ?? "https";
    const host = req.headers["host"] as string;
    const baseUrl = `${proto}://${host}`;

    const cartMeta: CartMeta[] = [];

    const line_items = await Promise.all(
      items.map(async (item) => {
        let variantId: number | null = null;
        if (printifyKey && shopId) {
          variantId = await findVariantId(printifyKey, shopId, item.productId, item.colorName, item.sizeName);
        }
        if (variantId !== null) {
          cartMeta.push({ p: item.productId, v: variantId, q: item.quantity });
        }
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
      }),
    );

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
