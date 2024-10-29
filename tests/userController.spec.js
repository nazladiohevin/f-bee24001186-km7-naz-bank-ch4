import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import UserController from "../controllers/userController.js";
import User from "../services/User.js";


describe("UserController", () => {
  let userController;
  let req, res, next;

  beforeEach(() => {
    userController = new UserController();

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
  
  describe("createUser", () => {
    it("should return success message if user is created", async () => {
      // Setup mock untuk user validation dan pembuatan user
      jest.spyOn(User.prototype, 'validateUser').mockReturnValue({ error: null });
      jest.spyOn(User.prototype, 'createUser').mockResolvedValue({});

      req.body = { name: "John Doe", email: "johndoe@example.com", password: "123456" };

      await userController.createUser(req, res, next);

      expect(res.status).toBeCalledWith(200);
      expect(User.prototype.validateUser).toHaveBeenCalledWith(req.body);
      expect(User.prototype.createUser).toHaveBeenCalledWith(req.body);
      
      expect(res.json).toHaveBeenCalledWith({ message: "success" });
    });

    it("should call next with error if validation fails", async () => {
      const validationError = new Error("Validation error");
      User.prototype.validateUser = jest.fn().mockReturnValue({ error: validationError });

      await userController.createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(validationError);
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with error if createUser throws an error", async () => {
      // Mock validation to pass
      jest.spyOn(User.prototype, 'validateUser').mockReturnValue({ error: null });
      
      // Mock createUser to throw an error
      const creationError = new Error("Database error");
      jest.spyOn(User.prototype, 'createUser').mockRejectedValue(creationError);
  
      await userController.createUser(req, res, next);
  
      expect(User.prototype.validateUser).toHaveBeenCalledWith(req.body);
      expect(User.prototype.createUser).toHaveBeenCalledWith(req.body);
      expect(next).toHaveBeenCalledWith(creationError);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getUsers", () => {
    it("should return a list of users", async () => {
      const mockUsers = [{ id: 1, name: "John Doe" }];
      jest.spyOn(User.prototype, 'getUsers').mockResolvedValue(mockUsers);

      await userController.getUsers(req, res, next);

      expect(User.prototype.getUsers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it("should call next with error if getUsers throws an error", async () => {
      jest.spyOn(User.prototype, 'validateUser').mockReturnValue({ error: null });

      const gettingError = new Error("Database error");
      jest.spyOn(User.prototype, 'getUsers').mockRejectedValue(gettingError);

      await userController.getUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(gettingError);
    });
    
  });

  describe("getUserById", () => {
    it("should return user data when user is found", async () => {
      const mockUser = { id: 1, name: "John Doe" };
      jest.spyOn(User.prototype, 'getUserById').mockResolvedValue([mockUser]);

      req.params.id = "1";

      await userController.getUserById(req, res, next);

      expect(User.prototype.getUserById).toHaveBeenCalledWith(req.params);
      expect(res.json).toHaveBeenCalledWith([mockUser]);
    });

    it("should return 404 if user not found", async () => {
      jest.spyOn(User.prototype, 'getUserById').mockResolvedValue([]);

      req.params.id = "999";

      await userController.getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User ID not found!" });
    });

    
    it("should call next with error if getUserById throws an error", async () => {
      jest.spyOn(User.prototype, 'validateUser').mockReturnValue({ error: null });

      const gettingError = new Error("Database error");
      jest.spyOn(User.prototype, 'getUserById').mockRejectedValue(gettingError);

      await userController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(gettingError);
    });
  });

  describe("updateUser", () => {
    it("should return success message if user is updated", async () => {
      jest.spyOn(User.prototype, 'updateUser').mockResolvedValue(true);

      req.params.id = "1";
      req.body = { name: "Updated Name" };

      await userController.updateUser(req, res, next);

      expect(User.prototype.updateUser).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith({ message: "success" });
    });

    it("should call next with error if updateUser throws an error", async () => {
      jest.spyOn(User.prototype, 'validateUser').mockReturnValue({ error: null });

      const updateError = new Error("Database error");
      jest.spyOn(User.prototype, 'updateUser').mockRejectedValue(updateError);

      await userController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(updateError);
    });
  });
});
