import Stripe from "stripe";

const PRINTIFY_API = "https://api.printify.com/v1";

async function readRawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function createPrintifyOrder(session: Stripe.Checkout.Session): Promise<void> {
  const apiKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;
  if (!apiKey || !shopId) return;

  let cartItems: { p: string; v: number; q: number }[] = [];
  try {
    cartItems = JSON.parse(session.metadata?.cart_items ?? "[]");
  } catch {
    console.error("Failed to parse cart_items metadata");
    return;
  }
  if (!cartItems.length) return;

  const shipping = (session as any).shipping_details?.address;
  const customerName: string =
    (session as any).shipping_details?.name ?? session.customer_details?.name ?? "Customer";
  const nameParts = customerName.trim().split(" ");
  const firstName = nameParts[0] ?? "Customer";
  const lastName = nameParts.slice(1).join(" ") || "-";

  const orderBody = {
    external_id: session.id,
    label: "Project Handball Order",
    line_items: cartItems.map((item) => ({
      product_id: item.p,
      variant_id: item.v,
      quantity: item.q,
    })),
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
      console.log("Printify order created:", order.id);
    }
  } catch (err) {
    console.error("Error creating Printify order:", err);
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
    createPrintifyOrder(session).catch((err) =>
      console.error("Printify order creation failed:", err),
    );
  }

  res.status(200).json({ received: true });
}
