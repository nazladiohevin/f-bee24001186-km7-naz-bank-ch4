import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";
import Account from "../../services/Account.js";

// Mock Prisma Client
jest.unstable_mockModule("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    bankAccount: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    }
  }))
}));

const { PrismaClient: MockPrismaClient } = await import("@prisma/client");

describe("Account Service", () => {
  let accountService;
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = new MockPrismaClient();
    accountService = new Account();
    accountService.prisma = mockPrisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validateAccount", () => {
    it("should validate account data correctly", () => {
      const validData = {
        userId: 1,
        bankName: "bca",
        bankAccountNumber: "1234567890",
        balance: 100000
      };

      const { error } = accountService.validateAccount(validData);
      expect(error).toBeUndefined();
    });

    it("should return validation error if data is invalid", () => {
      const invalidData = {
        userId: -1,
        bankName: "unknown",
        bankAccountNumber: "1234",
        balance: -100
      };

      const { error } = accountService.validateAccount(invalidData);
      expect(error).not.toBeUndefined();
    });
  });

  describe("createAccount", () => {
    it("should create a bank account successfully", async () => {
      const accountData = {
        userId: 1,
        bankName: "bca",
        bankAccountNumber: "1234567890",
        balance: 100000
      };

      const mockAccount = { id: 1, ...accountData, createdAt: accountService.now };

      mockPrisma.bankAccount.create.mockResolvedValue(mockAccount);

      const account = await accountService.createAccount(accountData);

      expect(mockPrisma.bankAccount.create).toHaveBeenCalledWith({
        data: {
          userId: accountData.userId,
          bankName: accountData.bankName,
          bankAccountNumber: accountData.bankAccountNumber,
          balance: accountData.balance,
          createdAt: expect.any(Date)
        }
      });
      expect(account).toEqual(mockAccount);
    });
  });

  describe("getAccounts", () => {
    it("should return all active bank accounts", async () => {
      const mockAccounts = [
        { id: 1, userId: 1, bankName: "bca", bankAccountNumber: "1234567890", balance: 100000 },
        { id: 2, userId: 2, bankName: "bni", bankAccountNumber: "9876543210", balance: 200000 }
      ];

      mockPrisma.bankAccount.findMany.mockResolvedValue(mockAccounts);

      const accounts = await accountService.getAccounts();

      expect(mockPrisma.bankAccount.findMany).toHaveBeenCalledWith({
        where: { deleteAt: null }
      });
      expect(accounts).toEqual(mockAccounts);
    });
  });

  describe("getAccountById", () => {
    it("should return bank account with user details for given ID", async () => {
      const accountId = 1;
      const mockAccount = {
        id: accountId,
        userId: 1,
        bankName: "bca",
        bankAccountNumber: "1234567890",
        balance: 100000,
        user: { id: 1, name: "John Doe" }
      };

      mockPrisma.bankAccount.findUnique.mockResolvedValue(mockAccount);

      const account = await accountService.getAccountById(accountId);

      expect(mockPrisma.bankAccount.findUnique).toHaveBeenCalledWith({
        where: {
          id: accountId,
          deleteAt: null
        },
        include: { user: true }
      });
      expect(account).toEqual(mockAccount);
    });
  });

  describe("deleteAccount", () => {
    it("should soft delete the bank account", async () => {
      const accountId = 1;

      mockPrisma.bankAccount.update.mockResolvedValue({
        id: accountId,
        deleteAt: accountService.now
      });

      await accountService.deleteAccount(accountId);

      expect(mockPrisma.bankAccount.update).toHaveBeenCalledWith({
        where: { id: accountId },
        data: { deleteAt: expect.any(Date) }
      });
    });
  });
});
