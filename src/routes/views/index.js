import { Router } from "express";
import AuthController from "../../controllers/authController.js";

const router = new Router();

const auth = new AuthController();

router.get("/forgot-password", auth.forgotPasswordPage.bind(auth));
router.get("/notification", auth.notificationPage.bind(auth));

export { router };