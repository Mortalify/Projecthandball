import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import ordersRouter from "./orders.js";
import authRouter from "./auth.js";
import registrationsRouter from "./registrations.js";
import clinicRegistrationsRouter from "./clinic-registrations.js";
import leaderboardRouter from "./leaderboard.js";
import printifyRouter from "./printify.js";
import stripeRouter from "./stripe.js";
import youtubeRouter from "./youtube.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ordersRouter);
router.use(authRouter);
router.use(registrationsRouter);
router.use(clinicRegistrationsRouter);
router.use(leaderboardRouter);
router.use(printifyRouter);
router.use(stripeRouter);
router.use(youtubeRouter);

export default router;
