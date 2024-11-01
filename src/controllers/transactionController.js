import Transaction from "../services/Transaction.js";

class TransactionController {

  constructor() {
    this.transaction = new Transaction();
  }

  async createTransaction(req, res, next){
    try {
      
      const { error } = this.transaction.validateTransaction(req.body);
      if (error) {
        next(error);
        return;
      }

      const transaction = await this.transaction.createTransaction(req.body, res);

      if (transaction) {
        res.status(200).json({ message: "success" });
      }

    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {

      const transactions = await this.transaction.getTransactions();

      res.json(transactions);
    } catch (error) {
      next(error);
    }
  }

  async getTransactionById(req, res, next) {
    try {
      
      const userId = parseInt(req.params.id);
      const transaction = await this.transaction.getTransactionById(userId);

      if (transaction.length == 0) {
        return res.status(404).json({ message: "Transaction ID not found!" });
      }

      res.json(transaction);
      
    } catch (error) {
      next(error);
    }
  }

}

export default TransactionController;