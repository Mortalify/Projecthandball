import { Router, type IRouter } from "express";
import { db, registrationsTable, registerForTournamentSchema } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { optionalAuth } from "../middlewares/require-auth.js";
import { logger } from "../lib/logger.js";
import { getUncachableStripeClient } from "../stripeClient.js";

const router: IRouter = Router();

router.post("/registrations", optionalAuth, async (req, res): Promise<void> => {
  const parsed = registerForTournamentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }

  const { tournamentId, name, email, phone, partnerName, isPaidTournament } = parsed.data;

  const existing = await db.select().from(registrationsTable)
    .where(eq(registrationsTable.email, email.toLowerCase()))
    .limit(1);

  for (const reg of existing) {
    if (reg.tournamentId === tournamentId) {
      res.status(409).json({ error: "You are already registered for this tournament" });
      return;
    }
  }

  const [registration] = await db.insert(registrationsTable).values({
    tournamentId,
    playerId: req.player?.id ?? null,
    name,
    email: email.toLowerCase(),
    phone,
    partnerName: partnerName || null,
    isPaidTournament,
  }).returning();

  req.log.info({ tournamentId, email, isPaidTournament }, "Tournament registration");

  if (!isPaidTournament) {
    const leadEmail = process.env.LEAD_EMAIL;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey && leadEmail) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: "Project Handball <tournaments@projecthandball.com>",
          to: leadEmail,
          subject: `New Tournament Registration — ${name}`,
          html: `<p>New free tournament registration from <strong>${name}</strong> (${email}) for tournament <strong>${tournamentId}</strong>. Phone: ${phone}${partnerName ? `. Partner: ${partnerName}` : ""}.</p>`,
        });
      } catch (err) {
        logger.warn({ err }, "Failed to send registration lead email");
      }
    }
  }

  res.status(201).json({ success: true, registrationId: registration?.id });
});

router.post("/registrations/tournament-checkout", optionalAuth, async (req, res): Promise<void> => {
  const { tournamentId, tournamentName, entryFee, name, email, phone, partnerName } = req.body ?? {};

  if (!tournamentId || !tournamentName || !entryFee || !name || !email || !phone) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const stripe = await getUncachableStripeClient();
    const baseUrl = process.env.APP_URL ?? `${req.protocol}://${req.get("host")}`;

    const description = partnerName
      ? `Registered: ${name} & ${partnerName}`
      : `Registered: ${name}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(Number(entryFee) * 100),
            product_data: {
              name: `${tournamentName} — Entry Fee`,
              description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "tournament",
        tournamentId,
        name,
        email,
        phone,
        partnerName: partnerName ?? "",
      },
      success_url: `${baseUrl}/tournaments?registered=1`,
      cancel_url: `${baseUrl}/tournaments`,
    });

    if (!session.url) {
      res.status(500).json({ error: "Stripe did not return a checkout URL" });
      return;
    }

    res.status(200).json({ url: session.url });
  } catch (err: unknown) {
    req.log.error({ err }, "Tournament checkout error");
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed to start checkout" });
  }
});

router.get("/registrations/:tournamentId/count", async (req, res): Promise<void> => {
  const { tournamentId } = req.params;
  const [result] = await db.select({ count: count() }).from(registrationsTable)
    .where(eq(registrationsTable.tournamentId, tournamentId));
  res.json({ count: result?.count ?? 0 });
});

export default router;
