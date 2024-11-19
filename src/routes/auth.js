import { Router } from "express";
import AuthController from "../controllers/authController.js";

const router = new Router();

const auth = new AuthController();

router.post("/login", auth.login.bind(auth));
router.post("/register", auth.register.bind(auth));
router.post("/forgot-password", auth.forgotPassword.bind(auth));
router.post("/reset-password", auth.resetPassword.bind(auth));

export { router };