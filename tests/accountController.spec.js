import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import AccountController from "../controllers/accountController.js";
import Account from "../services/Account.js";


describe("AccountController", () => {
  let accountController;
  let req, res, next;
  let date;

  beforeEach(() => {
    accountController = new AccountController();

    date = new Date();

    req = {
      body: {},
      params: {}
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createAccount", () => {
    it("should return success message if account is created", async () => {      
      jest.spyOn(Account.prototype, 'validateAccount').mockReturnValue({ error: null });
      jest.spyOn(Account.prototype, 'createAccount').mockResolvedValue({});

      req.body = { 
        userId: 1,
        bankName: 'mandiri',
        bankAccountNumber: '12232323232',
        balance: 1200000,
        createdAt: date
      };

      await accountController.createAccount(req, res, next);

      expect(res.status).toBeCalledWith(200);
      expect(Account.prototype.validateAccount).toHaveBeenCalledWith(req.body);
      expect(Account.prototype.createAccount).toHaveBeenCalledWith(req.body);
      
      expect(res.json).toHaveBeenCalledWith({ message: "success" });
    });

    it("should call next with error if validation fails", async () => {
      const validationError = new Error("Validation error");
      Account.prototype.validateAccount = jest.fn().mockReturnValue({ error: validationError });

      await accountController.createAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(validationError);
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with error if createAccount throws an error", async () => {      
      jest.spyOn(Account.prototype, 'validateAccount').mockReturnValue({ error: null });
      
      // Mock createAccount to throw an error
      const creationError = new Error("Database error");
      jest.spyOn(Account.prototype, 'createAccount').mockRejectedValue(creationError);
  
      await accountController.createAccount(req, res, next);
  
      expect(Account.prototype.validateAccount).toHaveBeenCalledWith(req.body);
      expect(Account.prototype.createAccount).toHaveBeenCalledWith(req.body);
      expect(next).toHaveBeenCalledWith(creationError);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getAccounts", () => {
    it("return a list of accounts", async () => {
      const mockAccounts = [{
        id: 1, userId: 2,
        bankName: 'bca',
        bankAccountNumber: '2323232311',
        balance: 13400000,
        createdAt: date
      }]

      jest.spyOn(Account.prototype, "getAccounts").mockResolvedValue(mockAccounts);
      
      await accountController.getAccounts(req, res, next);

      expect(Account.prototype.getAccounts).toHaveBeenCalled();      
      expect(res.json).toHaveBeenCalledWith(mockAccounts);
    });

    it("call next with error if getAccounts throws an error", async () => {
      const gettingError = new Error("Database error");

      jest.spyOn(Account.prototype, 'getAccounts').mockRejectedValue(gettingError);

      await accountController.getAccounts(req, res, next);

      expect(next).toHaveBeenCalledWith(gettingError);
      expect(res.json).not.toHaveBeenCalled();
    })

  });

  describe("getAccountById", () => {
    it("should return account details if account ID is found", async () => {      
      const mockAccountDetails = [{ id: 1, bankName: "bca", balance: 1000 }];
      jest.spyOn(Account.prototype, 'getAccountById').mockResolvedValue(mockAccountDetails);
  
      await accountController.getAccountById(req, res, next);
  
      expect(res.json).toHaveBeenCalledWith(mockAccountDetails);
      expect(res.status).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  
    it("should return 404 if account ID is not found", async () => {
      jest.spyOn(Account.prototype, 'getAccountById').mockResolvedValue([]);
  
      await accountController.getAccountById(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Account ID not found!" });
      expect(next).not.toHaveBeenCalled();
    });

    it("call next with error id getAccountById throws an error", async () => {
      req.params = { id: 1 };

      const gettingAccountError = new Error("Database error");
      jest.spyOn(Account.prototype, "getAccountById").mockRejectedValue(gettingAccountError);

      await accountController.getAccountById(req, res, next);

      expect(next).toHaveBeenCalledWith(gettingAccountError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  })

  describe("deleteAccount", () => {

    it("return success message if account is deleted successfully", async () => {
      req.params = { id: 1 };
  
      // Mocking method to return a valid account
      jest.spyOn(Account.prototype, 'getAccountById').mockResolvedValue([{}]); // Simulasi account ditemukan
      jest.spyOn(Account.prototype, 'deleteAccount').mockResolvedValue({}); // Simulasi akun berhasil dihapus
  
      await accountController.deleteAccount(req, res, next);
  
      expect(res.json).toHaveBeenCalledWith({ message: "success" });
      expect(next).not.toHaveBeenCalled();
    });
  
    it("return 404 if account ID is not found", async () => {
      req.params = { id: 1 };
  
      // Mocking method to return an empty array (akun tidak ditemukan)
      jest.spyOn(Account.prototype, 'getAccountById').mockResolvedValue([]);
  
      await accountController.deleteAccount(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Bank Account ID not found!" });
      expect(next).not.toHaveBeenCalled();
    });
  
    it("call next with error if deleteAccount throws an error", async () => {
      req.params = { id: 1 };
  
      // Mocking method to return a valid account
      jest.spyOn(Account.prototype, 'getAccountById').mockResolvedValue([{}]); // Simulasi account ditemukan

      const deleteError = new Error('Database error');
      jest.spyOn(Account.prototype, 'deleteAccount').mockRejectedValue(deleteError); // Simulasi kesalahan
  
      await accountController.deleteAccount(req, res, next);
  
      expect(next).toHaveBeenCalledWith(deleteError);
      expect(res.json).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  })

})