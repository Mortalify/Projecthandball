// @ts-nocheck
export default async function handler(req: any, res: any) {
  const apiKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;
  if (!apiKey || !shopId) return res.status(500).json({ error: "Printify not configured" });

  const r = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json?limit=20&page=1`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const data = await r.json();

  // Return just the fields relevant to filtering
  const summary = (data.data ?? []).map((p: any) => ({
    id: p.id,
    title: p.title,
    visible: p.visible,
    status: p.status,
    is_locked: p.is_locked,
    publish_details: p.publish_details,
  }));

  res.json(summary);
}
