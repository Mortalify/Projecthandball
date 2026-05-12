export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=30, s-maxage=30");

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!channelId) return res.status(200).json({ live: false, reason: "YOUTUBE_CHANNEL_ID not configured" });

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/channel/${channelId}/live&format=json`;
    const response = await fetch(oembedUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
    });

    if (!response.ok) {
      return res.status(200).json({ live: false });
    }

    const data = await response.json() as any;
    const videoId = extractVideoId(data?.url ?? data?.thumbnail_url ?? "");

    return res.status(200).json({
      live: true,
      channelId,
      videoId,
      title: data?.title ?? null,
    });
  } catch {
    return res.status(200).json({ live: false });
  }
}

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:v=|\/vi?\/|youtu\.be\/|\/embed\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}
