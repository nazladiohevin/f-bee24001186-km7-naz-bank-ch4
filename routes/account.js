import { Router } from "express";
import AccountController from "../controllers/accountController.js";
import { isAuthorized } from "../middleware/auth.js"

const router = new Router();

const account = new AccountController();

router.post("/", isAuthorized, account.createAccount.bind(account));

router.get("/", isAuthorized, account.getAccounts.bind(account));

router.get("/:id", isAuthorized, account.getAccountById.bind(account));

router.delete("/:id", isAuthorized, account.deleteAccount.bind(account));

export { router };