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

  validateTransaction(data){
    return this.transactionSchema.validate(data)
  }

  async createTransaction(data) {
    const sourceAccountId = parseInt(data.source_account_id);
    const destinationAccountId = parseInt(data.destination_account_id);
    const amount = data.amount;

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

    return transaction;
  }

  async getTransactions() {    
    return this.prisma.transaction.findMany();      
  }

  async getTransactionById(userId) {    
    return this.prisma.transaction.findMany({
      where: {
        id: userId,
      },
      include: {
        sourceAccount: true,
        destinationAccount: true,
      }
    });
  }
}

export default Transaction;
