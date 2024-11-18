import { Router } from "express";
import SentryTestController from "../controllers/sentryTestController.js";

const router = new Router();

router.get("/debug-sentry", SentryTestController.sentryDebugTest1);
router.get("/debug-sentry-2", SentryTestController.sentryDebugTest2);

export { router };