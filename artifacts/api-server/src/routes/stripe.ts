import { Router, type IRouter } from "express";
import { logger } from "../lib/logger.js";
import { getUncachableStripeClient, getStripePublishableKey } from "../stripeClient.js";

const router: IRouter = Router();

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

export async function createPrintifyOrderFromSession(session: any): Promise<void> {
  const apiKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;
  if (!apiKey || !shopId) {
    logger.error("Printify not configured — cannot create order");
    return;
  }

  let cartItems: CartMeta[] = [];
  try {
    cartItems = JSON.parse(session.metadata?.cart_items ?? "[]");
  } catch {
    logger.error({ sessionId: session.id }, "Failed to parse cart_items metadata");
    return;
  }

  if (cartItems.length === 0) return;

  const shipping = session.shipping_details?.address;
  const customerName: string = session.shipping_details?.name ?? session.customer_details?.name ?? "Customer";
  const nameParts = customerName.trim().split(" ");
  const firstName = nameParts[0] ?? "Customer";
  const lastName = nameParts.slice(1).join(" ") || "-";

  const orderBody = {
    external_id: session.id,
    label: `Project Handball Order`,
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
      const err = await res.text();
      logger.error({ sessionId: session.id, status: res.status, err }, "Failed to create Printify order");
    } else {
      const order = await res.json() as any;
      logger.info({ sessionId: session.id, printifyOrderId: order.id }, "Printify order created");
    }
  } catch (err) {
    logger.error({ err, sessionId: session.id }, "Error creating Printify order");
  }
}

router.get("/stripe/config", async (_req, res) => {
  try {
    const publishableKey = await getStripePublishableKey();
    res.json({ publishableKey });
  } catch (err) {
    logger.error({ err }, "Failed to get Stripe config");
    res.status(500).json({ error: "Stripe not configured" });
  }
});

router.post("/stripe/checkout", async (req, res) => {
  const apiKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const items: CheckoutItem[] = req.body.items ?? [];

  if (!items.length) {
    res.status(400).json({ error: "No items in cart" });
    return;
  }

  try {
    const stripe = await getUncachableStripeClient();

    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;

    const cartMeta: CartMeta[] = [];

    const line_items = await Promise.all(
      items.map(async (item) => {
        let variantId: number | null = null;
        if (apiKey && shopId) {
          variantId = await findVariantId(apiKey, shopId, item.productId, item.colorName, item.sizeName);
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

    res.json({ url: session.url });
  } catch (err) {
    logger.error({ err }, "Failed to create Stripe checkout session");
    res.status(500).json({ error: "Failed to start checkout" });
  }
});

export default router;
