import { Router, type IRouter } from "express";
import { db, playersTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

const RANK_ORDER: Record<string, number> = { s: 0, a: 1, b: 2, c: 3, unranked: 4 };

router.get("/leaderboard", async (_req, res): Promise<void> => {
  const players = await db.select({
    id: playersTable.id,
    name: playersTable.name,
    rank: playersTable.rank,
    wins: playersTable.wins,
    losses: playersTable.losses,
    createdAt: playersTable.createdAt,
  }).from(playersTable).orderBy(desc(playersTable.wins));

  const sorted = players.sort((a, b) => {
    const ra = RANK_ORDER[a.rank] ?? 4;
    const rb = RANK_ORDER[b.rank] ?? 4;
    if (ra !== rb) return ra - rb;
    return b.wins - a.wins;
  });

  res.json({ players: sorted });
});

export default router;
