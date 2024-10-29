import { Router } from "express";
import TransactionController from "../controllers/transactionController.js";
import { isAuthorized } from "../middleware/auth.js"


const router = new Router();

const transaction = new TransactionController();

router.post("/", isAuthorized, transaction.createTransaction.bind(transaction));
router.get("/", isAuthorized, transaction.getTransactions.bind(transaction));
router.get("/:id", isAuthorized, transaction.getTransactionById.bind(transaction));


export { router };