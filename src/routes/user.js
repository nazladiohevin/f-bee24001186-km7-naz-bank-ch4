import { Router } from "express";
import UserController from "../controllers/userController.js";
import { isAuthorized } from "../middleware/auth.js";

const router = new Router();

const user = new UserController();

router.get("/", isAuthorized, user.getUsers.bind(user));
router.post("/:id/profile", isAuthorized, user.createUserProfile.bind(user));
router.get("/:id", isAuthorized, user.getUserById.bind(user));
router.put("/:id", isAuthorized, user.updateUser.bind(user))

export { router };