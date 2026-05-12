import { Router, type IRouter } from "express";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:v=|\/vi?\/|youtu\.be\/|\/embed\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}

router.get("/youtube/live", async (req, res): Promise<void> => {
  res.setHeader("Cache-Control", "public, max-age=30");

  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!channelId) {
    res.json({ live: false, reason: "YOUTUBE_CHANNEL_ID not configured" });
    return;
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/channel/${channelId}/live&format=json`;
    const response = await fetch(oembedUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
    });

    if (!response.ok) {
      res.json({ live: false });
      return;
    }

    const data = await response.json() as any;
    const videoId = extractVideoId(data?.url ?? data?.thumbnail_url ?? "");

    res.json({ live: true, channelId, videoId, title: data?.title ?? null });
  } catch (err) {
    logger.warn({ err }, "YouTube live check failed");
    res.json({ live: false });
  }
});

export default router;
