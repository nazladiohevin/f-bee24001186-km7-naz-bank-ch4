import { Router } from "express";
import UserController from "../controllers/userController.js";

const router = new Router();

const user = new UserController();

router.post("/", user.createUser.bind(user));

router.get("/", user.getUsers.bind(user));

router.get("/:id", user.getUserById.bind(user));

router.put("/:id", user.updateUser.bind(user))

export { router };