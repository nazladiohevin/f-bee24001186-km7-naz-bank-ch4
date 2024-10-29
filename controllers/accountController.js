import Account from "../services/Account.js";

class AccountController {

  constructor() {
    this.account = new Account();
  }

  async createAccount(req, res, next) {
    try {
      const { error } = this.account.validateAccount(req.body);
      if (error) {
        return next(error);
      }

      const account = await this.account.createAccount(req.body);
      res.status(200).json({ message: "success" });
    } catch (error) {
      next(error);
    }
  }

  async getAccounts(req, res, next) {
    try {
      const bankAccounts = await this.account.getAccounts();
      res.json(bankAccounts);
    } catch (error) {
      next(error);
    }
  }

  async getAccountById(req, res, next) {
    try {
      const accountId = parseInt(req.params.id);
      const bankAccountDetails = await this.account.getAccountById(accountId);

      if (bankAccountDetails.length === 0) {
        return res.status(404).json({ message: "Account ID not found!" });
      }

      res.json(bankAccountDetails);
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      const accountId = parseInt(req.params.id);
      const bankAccount = await this.account.getAccountById(accountId);

      if (bankAccount.length === 0) {
        return res.status(404).json({ message: "Bank Account ID not found!" });
      }

      await this.account.deleteAccount(accountId);

      res.json({ message: "success" });
      
    } catch (error) {
      next(error);
    }
  }
  
}

export default AccountController;