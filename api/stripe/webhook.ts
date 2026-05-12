import Stripe from "stripe";
import { Client } from "pg";

const PRINTIFY_API = "https://api.printify.com/v1";

async function readRawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
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
    if (!res.ok) {
      console.error(`Printify product fetch failed [${res.status}] for product ${productId}`);
      return null;
    }
    const product = await res.json() as any;
    const colorOption = product.options?.find((o: any) => o.name === "Colors");
    const sizeOption = product.options?.find((o: any) => o.name === "Sizes");

    const colorValue = colorOption?.values?.find(
      (v: any) => v.title.toLowerCase() === colorName.toLowerCase(),
    );
    const sizeValue = sizeOption?.values?.find(
      (v: any) => v.title.toLowerCase() === sizeName.toLowerCase(),
    );

    // If neither color nor size matched, log and bail
    if (!colorValue && !sizeValue) {
      console.error(`No matching color/size for product ${productId}: color="${colorName}" size="${sizeName}"`);
      return null;
    }

    const variant = product.variants?.find((v: any) => {
      if (!v.is_enabled) return false;
      const hasColor = colorValue ? v.options.includes(colorValue.id) : true;
      const hasSize = sizeValue ? v.options.includes(sizeValue.id) : true;
      return hasColor && hasSize;
    });

    if (!variant) {
      console.error(`No enabled variant found for product ${productId}: color="${colorName}" size="${sizeName}"`);
      return null;
    }

    return variant.id;
  } catch (err) {
    console.error(`Exception looking up variant for product ${productId}:`, err);
    return null;
  }
}

async function createPrintifyOrder(session: Stripe.Checkout.Session): Promise<void> {
  const apiKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;
  if (!apiKey || !shopId) {
    console.error("PRINTIFY_API_KEY or PRINTIFY_SHOP_ID not set");
    return;
  }

  let rawCart: { p: string; c: string; s: string; q: number }[] = [];
  try {
    rawCart = JSON.parse(session.metadata?.cart_items ?? "[]");
  } catch {
    console.error("Failed to parse cart_items metadata:", session.metadata?.cart_items);
    return;
  }

  if (!rawCart.length) {
    console.error("cart_items is empty — cannot create Printify order for session:", session.id);
    return;
  }

  // Resolve variant IDs now, at webhook time
  const lineItems: { product_id: string; variant_id: number; quantity: number }[] = [];
  for (const item of rawCart) {
    const variantId = await findVariantId(apiKey, shopId, item.p, item.c, item.s);
    if (variantId === null) {
      console.error(`Skipping item — could not resolve variant: product=${item.p} color="${item.c}" size="${item.s}"`);
      continue;
    }
    lineItems.push({ product_id: item.p, variant_id: variantId, quantity: item.q });
  }

  if (!lineItems.length) {
    console.error("No line items resolved — Printify order not created for session:", session.id);
    return;
  }

  const shipping = (session as any).shipping_details?.address;
  const customerName: string =
    (session as any).shipping_details?.name ?? session.customer_details?.name ?? "Customer";
  const nameParts = customerName.trim().split(" ");
  const firstName = nameParts[0] ?? "Customer";
  const lastName = nameParts.slice(1).join(" ") || "-";

  const orderBody = {
    external_id: session.id,
    label: "Project Handball Order",
    line_items: lineItems,
    shipping_method: 1,
    send_shipping_notification: true,
    address_to: {
      first_name: firstName,
      last_name: lastName,
      email: session.customer_details?.email ?? "",
      phone: session.customer_details?.phone ?? "",
      country: shipping?.country ?? "US",
      region: shipping?.state ?? "",
      address1: shipping?.line1 ?? "",
      address2: shipping?.line2 ?? "",
      city: shipping?.city ?? "",
      zip: shipping?.postal_code ?? "",
    },
  };

  try {
    const res = await fetch(`${PRINTIFY_API}/shops/${shopId}/orders.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderBody),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`Printify order failed [${res.status}]:`, text);
    } else {
      const order = await res.json() as any;
      console.log("Printify order created successfully:", order.id);
    }
  } catch (err) {
    console.error("Error creating Printify order:", err);
  }
}

async function saveTournamentRegistration(meta: Record<string, string>): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set — cannot save tournament registration");
    return;
  }

  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();

    const existing = await client.query(
      "SELECT id FROM registrations WHERE tournament_id = $1 AND email = $2 LIMIT 1",
      [meta.tournamentId, meta.email.toLowerCase()],
    );
    if ((existing.rowCount ?? 0) > 0) {
      console.log("Tournament registration already exists, skipping duplicate");
      return;
    }

    await client.query(
      `INSERT INTO registrations (tournament_id, name, email, phone, partner_name, is_paid_tournament)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        meta.tournamentId,
        meta.name,
        meta.email.toLowerCase(),
        meta.phone,
        meta.partnerName || null,
        true,
      ],
    );
    console.log("Tournament registration saved:", meta.tournamentId, meta.email);
  } catch (err) {
    console.error("Failed to save tournament registration:", err);
  } finally {
    await client.end();
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  const sig = req.headers["stripe-signature"] as string;
  if (!sig) return res.status(400).json({ error: "Missing stripe-signature" });

  let rawBody: Buffer;
  try {
    rawBody = await readRawBody(req);
  } catch {
    return res.status(400).json({ error: "Failed to read request body" });
  }

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(secretKey, { apiVersion: "2025-08-27.basil" as any });
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};

    if (meta.type === "tournament") {
      saveTournamentRegistration(meta).catch((err) =>
        console.error("Tournament registration save failed:", err),
      );
    } else {
      createPrintifyOrder(session).catch((err) =>
        console.error("Printify order creation failed:", err),
      );
    }
  }

  res.status(200).json({ received: true });
}
