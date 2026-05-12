import { Router, type IRouter } from "express";
import { db, clinicRegistrationsTable, registerForClinicSchema } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

router.post("/clinic-registrations", async (req, res): Promise<void> => {
  const parsed = registerForClinicSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }

  const { clinicId, name, email, phone, age, guardianName, waiverAccepted } = parsed.data;

  if (age < 18 && !waiverAccepted) {
    res.status(400).json({ error: "Parental waiver must be accepted for participants under 18" });
    return;
  }

  if (age < 18 && !guardianName?.trim()) {
    res.status(400).json({ error: "Guardian name is required for participants under 18" });
    return;
  }

  const existing = await db
    .select()
    .from(clinicRegistrationsTable)
    .where(eq(clinicRegistrationsTable.email, email.toLowerCase()))
    .limit(10);

  for (const reg of existing) {
    if (reg.clinicId === clinicId) {
      res.status(409).json({ error: "You are already registered for this clinic" });
      return;
    }
  }

  await db.insert(clinicRegistrationsTable).values({
    clinicId,
    name,
    email: email.toLowerCase(),
    phone,
    age,
    guardianName: guardianName?.trim() || null,
    waiverAccepted: age < 18 ? waiverAccepted : false,
  });

  logger.info({ clinicId, email, age }, "Clinic registration saved");

  const leadEmail = process.env.LEAD_EMAIL;
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && leadEmail) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: "Project Handball <clinics@projecthandball.com>",
        to: leadEmail,
        subject: `New Clinic Registration — ${name}`,
        html: `<p>New clinic registration from <strong>${name}</strong> (${email}, age ${age}) for clinic <strong>${clinicId}</strong>. Phone: ${phone}${guardianName ? `. Guardian: ${guardianName}` : ""}.</p>`,
      });
    } catch (err) {
      logger.warn({ err }, "Failed to send clinic registration email");
    }
  }

  res.status(201).json({ success: true });
});

router.get("/clinic-registrations", async (req, res): Promise<void> => {
  const clinicId = req.query.clinicId as string | undefined;
  if (!clinicId) { res.status(400).json({ error: "clinicId required" }); return; }
  const [result] = await db
    .select({ count: count() })
    .from(clinicRegistrationsTable)
    .where(eq(clinicRegistrationsTable.clinicId, clinicId));
  res.json({ count: result?.count ?? 0 });
});

export default router;
