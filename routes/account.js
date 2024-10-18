import { Router } from "express";
import Account from "../services/Account.js";

const router = new Router();

const account = new Account();

router.post("/", account.createAccount.bind(account));

router.get("/", account.getAccounts.bind(account));

router.get("/:id", account.getAccountById.bind(account));

router.delete("/:id", account.deleteAccount.bind(account));

export { router };