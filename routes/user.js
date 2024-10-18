import { Router } from "express";
import User from "../services/User.js";

const router = new Router();

const user = new User();

router.post("/", user.createUser.bind(user));

router.get("/", user.getUsers.bind(user));

router.get("/:id", user.getUserById.bind(user));

export { router };