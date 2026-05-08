import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

interface OrderPayload {
  customer: { name: string; email: string; phone: string };
  shipping: { address: string; city: string; state: string; zip: string; country: string };
  order: {
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    total: number;
    freeShipping: boolean;
  };
}

function buildEmailHtml(payload: OrderPayload): string {
  const { customer, shipping, order } = payload;
  const itemRows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.size}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">$${item.lineTotal.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Project Handball Order</title></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f0f4ff;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,33,81,0.12);">
    <div style="background:#002151;padding:28px 32px;text-align:center;">
      <h1 style="color:#fff;font-size:22px;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;margin:0;">Project Handball</h1>
      <p style="color:#3BB7FD;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;margin:6px 0 0;">New Order Lead</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#002151;font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px;">Customer Info</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
        <tr><td style="padding:6px 0;color:#64748b;width:120px;">Name</td><td style="padding:6px 0;font-weight:600;">${customer.name}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;font-weight:600;"><a href="mailto:${customer.email}" style="color:#3BB7FD;">${customer.email}</a></td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Phone</td><td style="padding:6px 0;font-weight:600;">${customer.phone}</td></tr>
      </table>

      <h2 style="color:#002151;font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px;">Shipping Address</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
        <tr><td style="padding:6px 0;color:#64748b;width:120px;">Address</td><td style="padding:6px 0;font-weight:600;">${shipping.address}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">City</td><td style="padding:6px 0;font-weight:600;">${shipping.city}, ${shipping.state} ${shipping.zip}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Country</td><td style="padding:6px 0;font-weight:600;">${shipping.country}</td></tr>
      </table>

      <h2 style="color:#002151;font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px;">Order Details</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:8px;">
        <thead>
          <tr style="background:#f0f4ff;">
            <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Product</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Size</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#64748b;">Subtotal</td><td style="padding:6px 0;text-align:right;">$${order.subtotal.toFixed(2)}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Shipping</td><td style="padding:6px 0;text-align:right;">${order.freeShipping ? "Free" : `$${order.shipping.toFixed(2)}`}</td></tr>
        <tr style="font-weight:900;font-size:16px;">
          <td style="padding:10px 0 0;color:#002151;">Total</td>
          <td style="padding:10px 0 0;text-align:right;color:#3BB7FD;">$${order.total.toFixed(2)}</td>
        </tr>
      </table>
    </div>
    <div style="background:#f0f4ff;padding:16px 32px;text-align:center;">
      <p style="font-size:11px;color:#94a3b8;margin:0;">Project Handball &mdash; projecthandball.com</p>
    </div>
  </div>
</body>
</html>`;
}

router.post("/orders", async (req, res): Promise<void> => {
  const payload = req.body as OrderPayload;

  if (!payload?.customer?.name || !payload?.customer?.email || !payload?.customer?.phone) {
    res.status(400).json({ error: "Missing required customer fields" });
    return;
  }

  if (!payload?.shipping?.address || !payload?.shipping?.city || !payload?.shipping?.zip) {
    res.status(400).json({ error: "Missing required shipping fields" });
    return;
  }

  if (!payload?.order?.items?.length) {
    res.status(400).json({ error: "Order must have at least one item" });
    return;
  }

  const leadEmail = process.env.LEAD_EMAIL;
  const resendApiKey = process.env.RESEND_API_KEY;

  req.log.info(
    {
      customer: payload.customer.name,
      email: payload.customer.email,
      total: payload.order.total,
      itemCount: payload.order.items.length,
    },
    "New order received"
  );

  if (resendApiKey && leadEmail) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);

      await resend.emails.send({
        from: "Project Handball <orders@projecthandball.com>",
        to: leadEmail,
        subject: `New Order from ${payload.customer.name} — $${payload.order.total.toFixed(2)}`,
        html: buildEmailHtml(payload),
      });

      req.log.info({ email: leadEmail }, "Order email sent via Resend");
    } catch (err) {
      req.log.error({ err }, "Failed to send order email via Resend");
    }
  } else {
    logger.warn("RESEND_API_KEY or LEAD_EMAIL not set — order logged but email not sent");
  }

  res.status(201).json({
    success: true,
    message: "Order received. Our handball artisans are working on it.",
    orderId: `PH-${Date.now()}`,
  });
});

export default router;
