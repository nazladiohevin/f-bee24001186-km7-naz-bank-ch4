import { PrismaClient } from "@prisma/client";
import Joi from "joi";

class Account {

  constructor() {
    this.prisma = new PrismaClient();
    this.accountSchema = this._createSchema(); 
    this.now = new Date();
  }

  _createSchema() {
    return Joi.object({
      userId: Joi.number().integer().positive().required(),
      bankName: Joi.string().min(3).valid("bri", "bni", "mandiri", "bca", "muamalat").required(),
      bankAccountNumber: Joi.string().min(5).required(),
      balance: Joi.number().positive()
    });
  }

  validateAccount(data) {
    return this.accountSchema.validate(data);
  }

  async createAccount(data) {    
    return this.prisma.bankAccount.create({
      data: {
        userId: parseInt(data.userId),
        bankName: data.bankName,
        bankAccountNumber: data.bankAccountNumber,        
        balance: data.balance,
        createdAt: this.now
      }
    });
  }

  async getAccounts() {
    return this.prisma.bankAccount.findMany({
      where: {
        deleteAt: null
      }
    });
  }

  async getAccountById(accountId) {    
    return this.prisma.bankAccount.findUnique({      
      where: {
        id: parseInt(accountId),  
        deleteAt: null      
      },    
      include: {
        user: true
      }
    });
  }

  // Soft delete
  async deleteAccount(accountId) {  
    await this.prisma.bankAccount.update({
      where: {
        id: accountId
      },
      data: {
        deleteAt: this.now
      }
    });
  }
}

export default Account;