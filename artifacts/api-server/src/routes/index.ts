import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import ordersRouter from "./orders.js";
import authRouter from "./auth.js";
import registrationsRouter from "./registrations.js";
import leaderboardRouter from "./leaderboard.js";
import printifyRouter from "./printify.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ordersRouter);
router.use(authRouter);
router.use(registrationsRouter);
router.use(leaderboardRouter);
router.use(printifyRouter);

export default router;
