import { Router } from "express";
import TransactionController from "../controllers/transactionController.js";

const router = new Router();

const transaction = new TransactionController();

router.post("/", transaction.createTransaction.bind(transaction));

router.get("/", transaction.getTransactions.bind(transaction));

router.get("/:id", transaction.getTransactionById.bind(transaction));


export { router };