import { Router } from "express";
import UserController from "../controllers/userController.js";
import { isAuthorized } from "../middleware/auth.js";
import multer from "multer";

const router = new Router();

const user = new UserController();

router.get("/", isAuthorized, user.getUsers.bind(user));
router.get("/:id/profile", isAuthorized, user.getUserProfile.bind(user));
router.post("/:id/profile", isAuthorized, multer().single("avatar"), user.createUserProfile.bind(user));
router.put("/:id/profile", isAuthorized, multer().single("avatar"), user.updateUserProfile.bind(user));
router.delete("/:id/profile/avatar", isAuthorized, user.deleteAvatarUserProfile.bind(user));
router.get("/:id", isAuthorized, user.getUserById.bind(user));
router.put("/:id", isAuthorized, user.updateUser.bind(user))

export { router };