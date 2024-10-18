import { Router } from "express";
import Transaction from "../services/Transaction.js";

const router = new Router();


const transaction = new Transaction();

router.post("/", transaction.createTransaction.bind(transaction));

router.get("/", transaction.getTransactions.bind(transaction));

router.get("/:id", transaction.getTransactionById.bind(transaction));


export { router };