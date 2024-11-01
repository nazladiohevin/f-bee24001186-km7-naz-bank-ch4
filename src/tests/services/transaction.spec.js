import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import Transaction from "../../services/Transaction.js";

// Mock Prisma Client
jest.unstable_mockModule("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    bankAccount: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn()
    }
  }))
}));

const { PrismaClient: MockPrismaClient } = await import("@prisma/client");

describe("Transaction Service", () => {
  let transactionService;
  let mockPrisma;
  let mockRes;

  beforeEach(() => {
    mockPrisma = new MockPrismaClient();
    transactionService = new Transaction();
    transactionService.prisma = mockPrisma;

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validateTransaction", () => {
    it("should validate transaction data correctly", () => {
      const validData = {
        sourceAccountId: 1,
        destinationAccountId: 2,
        amount: 15000
      };

      const { error } = transactionService.validateTransaction(validData);
      expect(error).toBeUndefined();
    });

    it("should return validation error if data is invalid", () => {
      const invalidData = {
        sourceAccountId: -1,
        destinationAccountId: 2,
        amount: 5000
      };

      const { error } = transactionService.validateTransaction(invalidData);
      expect(error).not.toBeUndefined();
    });
  });

  describe("createTransaction", () => {
    it("should return 404 if source account is not found", async () => {
      const data = { sourceAccountId: 1, destinationAccountId: 2, amount: 15000 };

      mockPrisma.bankAccount.findUnique.mockResolvedValueOnce(null);

      await transactionService.createTransaction(data, mockRes);

      expect(mockPrisma.bankAccount.findUnique).toHaveBeenCalledWith({ where: { id: data.sourceAccountId } });
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Source Account ID not found" });
    });

    it("should return 404 if destination account is not found", async () => {
      const data = { sourceAccountId: 1, destinationAccountId: 2, amount: 15000 };

      mockPrisma.bankAccount.findUnique.mockResolvedValueOnce({ id: 1, balance: 50000 });
      mockPrisma.bankAccount.findUnique.mockResolvedValueOnce(null);

      await transactionService.createTransaction(data, mockRes);

      expect(mockPrisma.bankAccount.findUnique).toHaveBeenCalledWith({ where: { id: data.destinationAccountId } });
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Destination Account ID not found" });
    });

    it("should create a transaction and update account balances successfully", async () => {
      const data = { sourceAccountId: 1, destinationAccountId: 2, amount: 15000 };
      const mockTransaction = { id: 1, ...data, createdAt: transactionService.now };

      mockPrisma.bankAccount.findUnique
        .mockResolvedValueOnce({ id: 1, balance: 50000 }) // Source account found
        .mockResolvedValueOnce({ id: 2, balance: 20000 }); // Destination account found
      mockPrisma.transaction.create.mockResolvedValue(mockTransaction);
      mockPrisma.bankAccount.update.mockResolvedValue({});

      const transaction = await transactionService.createTransaction(data, mockRes);

      expect(mockPrisma.bankAccount.findUnique).toHaveBeenCalledWith({ where: { id: data.sourceAccountId } });
      expect(mockPrisma.bankAccount.findUnique).toHaveBeenCalledWith({ where: { id: data.destinationAccountId } });
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: {
          sourceAccountId: data.sourceAccountId,
          destinationAccountId: data.destinationAccountId,
          amount: data.amount,
          createdAt: expect.any(Date)
        }
      });
      expect(mockPrisma.bankAccount.update).toHaveBeenCalledWith({
        where: { id: data.sourceAccountId },
        data: { balance: { decrement: data.amount } }
      });
      expect(mockPrisma.bankAccount.update).toHaveBeenCalledWith({
        where: { id: data.destinationAccountId },
        data: { balance: { increment: data.amount } }
      });
      expect(transaction).toEqual(mockTransaction);
    });
  });

  describe("getTransactions", () => {
    it("should return all transactions", async () => {
      const mockTransactions = [
        { id: 1, sourceAccountId: 1, destinationAccountId: 2, amount: 15000, createdAt: transactionService.now },
        { id: 2, sourceAccountId: 2, destinationAccountId: 3, amount: 20000, createdAt: transactionService.now }
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);

      const transactions = await transactionService.getTransactions();

      expect(mockPrisma.transaction.findMany).toHaveBeenCalled();
      expect(transactions).toEqual(mockTransactions);
    });
  });

  describe("getTransactionById", () => {
    it("should return transaction details with source and destination accounts", async () => {
      const userId = 1;
      const mockTransaction = {
        id: userId,
        sourceAccountId: 1,
        destinationAccountId: 2,
        amount: 15000,
        createdAt: transactionService.now,
        sourceAccount: { id: 1, bankName: "bca" },
        destinationAccount: { id: 2, bankName: "bni" }
      };

      mockPrisma.transaction.findMany.mockResolvedValue([mockTransaction]);

      const transactions = await transactionService.getTransactionById(userId);

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: { id: userId },
        include: { sourceAccount: true, destinationAccount: true }
      });
      expect(transactions).toEqual([mockTransaction]);
    });
  });
});
