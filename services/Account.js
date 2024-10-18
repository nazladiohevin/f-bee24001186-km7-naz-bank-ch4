import { PrismaClient } from "@prisma/client";
import Joi from "joi";

class Account {

  constructor() {
    this.prisma = new PrismaClient();
    this.accountSchema = this._createSchema(); 
  }

  _createSchema() {
    return Joi.object({
      user_id: Joi.number().integer().positive().required(),
      bank_name: Joi.string().min(3).valid("bri", "bni", "mandiri", "bca", "muamalat").required(),
      bank_account_number: Joi.string().min(5).required(),
      balance: Joi.number().positive()
    });
  }

  async createAccount(req, res, next) {
    try {

      const { error } = this.accountSchema.validate(req.body);
  
      if (error) {
        next(error);
        return;
      }
  
      let account = await this.prisma.bankAccount.create({
        data: {
          userId: parseInt(req.body.user_id),
          bankName: req.body.bank_name,
          bankAccountNumber: req.body.bank_account_number,        
          balance: req.body.balance
        }
      });
  
      if (account) {
        res.json({ message: "success" });      
      }
  
    } catch(error) {
      next(error);
    }  
  }

  async getAccounts(req, res, next) {
    try {

      const bankAccounts = await this.prisma.bankAccount.findMany();
      
      res.json(bankAccounts);
  
    } catch(error) {
      next(error);
    }
  }

  async getAccountById(req, res, next) {
    try {    
      const bankAccountDetails = await this.prisma.bankAccount.findMany({      
        where: {
          id: parseInt(req.params.id),        
        },    
        include: {
          user: true
        }
      });
  
      if (bankAccountDetails.length == 0) {      
        return res.status(404).json({
          message: "Account ID not found!"
        });
      }
      
      res.json(bankAccountDetails);
  
    } catch(error) {
      next(error);
    }
  }
}

export default Account;