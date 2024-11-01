import { Router } from "express";
import AuthController from "../controllers/authController.js";

const router = new Router();

const auth = new AuthController();

router.post("/login", auth.login.bind(auth));
router.post("/register", auth.register.bind(auth));

export { router };