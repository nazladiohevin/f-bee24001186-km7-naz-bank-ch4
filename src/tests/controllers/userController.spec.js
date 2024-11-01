import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import UserController from "../../controllers/userController.js";
import User from "../../services/User.js";


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

  describe("createUserProfile", () => {
    it("should return success if profile is created successfully", async () => {
      req.params.id = "1";
      req.body = { identityType: "ktp", identityNumber: "123456789" };

      jest.spyOn(User.prototype, "getProfileByUserId").mockResolvedValue(null);
      jest.spyOn(User.prototype, "createUserProfile").mockResolvedValue(req.body);

      await userController.createUserProfile(req, res, next);

      expect(User.prototype.getProfileByUserId).toHaveBeenCalledWith(req.params.id);
      expect(User.prototype.createUserProfile).toHaveBeenCalledWith(req.params.id, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "success", data: req.body });
    });

    it("should return 400 if profile already exists", async () => {
      req.params.id = "1";

      jest.spyOn(User.prototype, "getProfileByUserId").mockResolvedValue({ id: 1, userId: req.params.id });

      await userController.createUserProfile(req, res, next);

      expect(User.prototype.getProfileByUserId).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Profile has been created" });
    });

    it("should call next with error if createUserProfile throws an error", async () => {
      req.params.id = "1";
      const error = new Error("Database Error");

      jest.spyOn(User.prototype, "getProfileByUserId").mockResolvedValue(null);
      jest.spyOn(User.prototype, "createUserProfile").mockRejectedValue(error);

      await userController.createUserProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it("should call next with error if profile not created", async () => {
      req.params.id = "1";      

      jest.spyOn(User.prototype, "getProfileByUserId").mockResolvedValue(null);
      jest.spyOn(User.prototype, "createUserProfile").mockReturnValue(null);

      await userController.createUserProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(new Error("Database Error"))
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getUserById", () => {
    it("should return user data when user is found", async () => {
      const mockUser = { id: 1, name: "John Doe" };
      jest.spyOn(User.prototype, 'getUserById').mockResolvedValue(mockUser);

      req.params.id = "1";

      await userController.getUserById(req, res, next);

      expect(User.prototype.getUserById).toHaveBeenCalledWith(req.params.id);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it("should return 404 if user not found", async () => {
      jest.spyOn(User.prototype, 'getUserById').mockResolvedValue(null);

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
    it("should return success if user is updated successfully", async () => {
      req.params.id = "1";
      req.body = { name: "Updated Name" };

      const updatedUser = { id: req.params.id, ...req.body };
      jest.spyOn(User.prototype, "getUserById").mockResolvedValue({});
      jest.spyOn(User.prototype, "updateUser").mockResolvedValue(updatedUser);

      await userController.updateUser(req, res, next);

      expect(User.prototype.updateUser).toHaveBeenCalledWith(parseInt(req.params.id), req.body);
      expect(res.json).toHaveBeenCalledWith({ message: "success", data: updatedUser });
    });

    it("should 'User not found' message if user not available", async () => {      

      jest.spyOn(User.prototype, "getUserById").mockResolvedValue(null);

      await userController.updateUser(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should call next with error if updateUser throws an error", async () => {
      req.params.id = "1";
      req.body = { name: "Updated Name" };

      const error = new Error("Database Error");
      jest.spyOn(User.prototype, "getUserById").mockResolvedValue({});
      jest.spyOn(User.prototype, "updateUser").mockRejectedValue(error);

      await userController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
