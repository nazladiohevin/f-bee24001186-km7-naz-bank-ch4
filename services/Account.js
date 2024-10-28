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
      user_id: Joi.number().integer().positive().required(),
      bank_name: Joi.string().min(3).valid("bri", "bni", "mandiri", "bca", "muamalat").required(),
      bank_account_number: Joi.string().min(5).required(),
      balance: Joi.number().positive()
    });
  }

  validateAccount(data) {
    return this.accountSchema.validate(data);
  }

  async createAccount(data) {    
    return this.prisma.bankAccount.create({
      data: {
        userId: parseInt(data.user_id),
        bankName: data.bank_name,
        bankAccountNumber: data.bank_account_number,        
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
    return this.prisma.bankAccount.findMany({      
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