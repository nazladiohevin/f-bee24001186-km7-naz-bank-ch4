import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import TransactionController from "../../controllers/transactionController";
import Transaction from '../../services/Transaction';

describe("TransactionController", () => {
  let transactionController;
  let req, res, next;

  beforeEach(() => {
    transactionController = new TransactionController();
    req = { body: {}, params: {} };
    res = {
      json: jest.fn(),
      status: jest.fn(() => res)
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createTransaction", () => {
    it("should call next with error if validation fails", async () => {
      const validationError = { message: "Validation Error" };
      
      jest.spyOn(Transaction.prototype, 'validateTransaction').mockReturnValue({ error: validationError });

      await transactionController.createTransaction(req, res, next);

      expect(next).toHaveBeenCalledWith(validationError);
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should create a transaction successfully if data is valid", async () => {
      req.body = { source_account_id: 1, destination_account_id: 2, amount: 10000 };

      jest.spyOn(Transaction.prototype, 'validateTransaction').mockReturnValue({ error: null });
      jest.spyOn(Transaction.prototype, 'createTransaction').mockResolvedValue({ id: 1 });

      await transactionController.createTransaction(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ message: "success" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with error if createTransaction throws an error", async () => {
      jest.spyOn(Transaction.prototype, "validateTransaction").mockReturnValue({ error: null });

      const createTransactionError = new Error("Database error");
      jest.spyOn(Transaction.prototype, "createTransaction").mockRejectedValue(createTransactionError);
      
      await transactionController.createTransaction(req, res, next);
      
      expect(next).toHaveBeenCalledWith(createTransactionError);
      expect(res.json).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();      
    })
  });

  describe("getTransactions", () => {
    it("should fetch and return all transactions", async () => {
      const mockTransactions = [
        { id: 1, sourceAccountId: 1, destinationAccountId: 2, amount: 10000 },
        { id: 2, sourceAccountId: 3, destinationAccountId: 4, amount: 20000 }
      ];

      jest.spyOn(Transaction.prototype, 'getTransactions').mockResolvedValue(mockTransactions);

      await transactionController.getTransactions(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockTransactions);
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with error if getTransactions throws an error", async () => {
      const gettingTransactionError = new Error("Database error");
      jest.spyOn(Transaction.prototype, "getTransactions").mockRejectedValue(gettingTransactionError);
      
      await transactionController.getTransactions(req, res, next);
      
      expect(next).toHaveBeenCalledWith(gettingTransactionError);
      expect(res.json).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();      
    })
  });

  describe("getTransactionById", () => {
    it("should return 404 if transaction ID is not found", async () => {
      req.params.id = 999;

      jest.spyOn(Transaction.prototype, 'getTransactionById').mockResolvedValue([]);

      await transactionController.getTransactionById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Transaction ID not found!" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should fetch and return transaction by ID if found", async () => {
      req.params.id = 1;
      const mockTransaction = [
        { id: 1, sourceAccountId: 1, destinationAccountId: 2, amount: 10000 }
      ];

      jest.spyOn(Transaction.prototype, 'getTransactionById').mockResolvedValue(mockTransaction);

      await transactionController.getTransactionById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockTransaction);
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with error if getTransactions throws an error", async () => {
      const gettingTransactionError = new Error("Database error");
      jest.spyOn(Transaction.prototype, "getTransactionById").mockRejectedValue(gettingTransactionError);
      
      await transactionController.getTransactionById(req, res, next);
      
      expect(next).toHaveBeenCalledWith(gettingTransactionError);
      expect(res.json).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();      
    })
  });
});
