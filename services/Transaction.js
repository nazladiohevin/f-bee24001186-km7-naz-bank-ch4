import { PrismaClient } from "@prisma/client";
import Joi from "joi";

class Transaction {
  constructor() {    
    this.prisma = new PrismaClient();
    this.transactionSchema = this._createSchema();
    this.now = new Date();
  }

  _createSchema() {
    return Joi.object({
      source_account_id: Joi.number().integer().positive().greater(0).required(),
      destination_account_id: Joi.number().integer().positive().greater(0).required(),
      amount: Joi.number().positive().min(10000).required(),
    });
  }

  async createTransaction(req, res, next) {
    try {
      const { error } = this.transactionSchema.validate(req.body);
      if (error) {
        next(error);
        return;
      }

      const sourceAccountId = parseInt(req.body.source_account_id);
      const destinationAccountId = parseInt(req.body.destination_account_id);
      const amount = req.body.amount;

      // Check if accounts exist
      const isSourceAccountFound = await this.prisma.bankAccount.findUnique({
        where: { id: sourceAccountId }
      });
      const isDestinationAccountFound = await this.prisma.bankAccount.findUnique({
        where: { id: destinationAccountId }
      });

      // Handle account not found
      if (!isSourceAccountFound) {
        return res.status(404).json({ message: "Source Account ID not found" });
      } else if (!isDestinationAccountFound) {
        return res.status(404).json({ message: "Destination Account ID not found" });
      }

      // Add new transaction
      let transaction = await this.prisma.transaction.create({
        data: {
          sourceAccountId,
          destinationAccountId,
          amount: amount,
          createdAt: this.now
        }
      });

      // Update account balances
      await this.prisma.bankAccount.update({
        where: { id: sourceAccountId },
        data: { balance: { decrement: amount } }
      });

      await this.prisma.bankAccount.update({
        where: { id: destinationAccountId },
        data: { balance: { increment: amount } }
      });

      if (transaction) {
        res.json({ message: "success" });
      }

    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const transactions = await this.prisma.transaction.findMany();
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  }

  async getTransactionById(req, res, next) {
    try {
      const transaction = await this.prisma.transaction.findMany({
        where: {
          id: parseInt(req.params.id),
        },
        include: {
          sourceAccount: true,
          destinationAccount: true,
        }
      });

      if (transaction.length == 0) {
        return res.status(404).json({ message: "Transaction ID not found!" });
      }

      res.json(transaction);
    } catch (error) {
      next(error);
    }
  }
}

export default Transaction;
