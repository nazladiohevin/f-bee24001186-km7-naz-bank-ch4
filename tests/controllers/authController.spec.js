import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AuthController from "../../controllers/authController.js";
import User from "../../services/User.js";

describe("AuthController", () => {
  let authController;
  let req, res, next;

  beforeEach(() => {
    authController = new AuthController();

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

  describe("login", () => {
    it("should return a token if login is successful", async () => {
      const mockUser = { id: 1, email: "test@example.com", password: "hashedpassword" };
      const token = "mockToken";

      req.body = { email: "test@example.com", password: "password123" };
      
      jest.spyOn(User.prototype, "getUserByEmail").mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
      jest.spyOn(jwt, "sign").mockReturnValue(token);

      await authController.login(req, res, next);

      expect(User.prototype.getUserByEmail).toHaveBeenCalledWith(req.body.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalledWith({ id: mockUser.id }, process.env.JWT_SECRET_KEY, { expiresIn: "72h" });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Success login",
        data: { ...mockUser, token }
      });
    });

    it("should return 400 if email does not exist", async () => {
      req.body = { email: "test@example.com", password: "password123" };

      jest.spyOn(User.prototype, "getUserByEmail").mockResolvedValue(null);

      await authController.login(req, res, next);

      expect(User.prototype.getUserByEmail).toHaveBeenCalledWith(req.body.email);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid email or password" });
    });

    it("should return 400 if password is incorrect", async () => {
      const mockUser = { id: 1, email: "test@example.com", password: "hashedpassword" };

      req.body = { email: "test@example.com", password: "wrongpassword" };
      
      jest.spyOn(User.prototype, "getUserByEmail").mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

      await authController.login(req, res, next);

      expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, mockUser.password);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid email or password" });
    });

    it("should call next with error if login throw error", async () => {      
      jest.spyOn(User.prototype, "getUserByEmail").mockRejectedValue(new Error("Database Error"));
      await authController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(new Error("Database Error"))      
    });
  });

  describe("register", () => {
    it("should return success message if user is successfully registered", async () => {
      const mockBody = { name: "John Doe", email: "johndoe@example.com", password: "123456" };
      const createdUser = { ...mockBody, createdAt: new Date(), updatedAt: null };

      req.body = mockBody;

      jest.spyOn(User.prototype, "validateUser").mockReturnValue({ error: null });
      jest.spyOn(User.prototype, "getUserByEmail").mockResolvedValue(null);
      jest.spyOn(User.prototype, "register").mockResolvedValue(createdUser);

      await authController.register(req, res, next);

      expect(User.prototype.validateUser).toHaveBeenCalledWith(req.body);
      expect(User.prototype.getUserByEmail).toHaveBeenCalledWith(req.body.email);
      expect(User.prototype.register).toHaveBeenCalledWith(req.body);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "success", data: createdUser });
    });

    it("should return 409 if email is already in use", async () => {
      const mockBody = { name: "John Doe", email: "johndoe@example.com", password: "123456" };

      req.body = mockBody;

      jest.spyOn(User.prototype, "validateUser").mockReturnValue({ error: null });
      jest.spyOn(User.prototype, "getUserByEmail").mockResolvedValue({ id: 1 });

      await authController.register(req, res, next);

      expect(User.prototype.getUserByEmail).toHaveBeenCalledWith(req.body.email);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: "Email already use" });
    });

    it("should call next with error if validation fails", async () => {
      const validationError = new Error("Validation error");
      jest.spyOn(User.prototype, "validateUser").mockReturnValue({ error: validationError });

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(validationError);
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with error if register throws an error", async () => {
      const mockBody = { name: "John Doe", email: "johndoe@example.com", password: "123456" };

      req.body = mockBody;

      jest.spyOn(User.prototype, "validateUser").mockReturnValue({ error: null });
      jest.spyOn(User.prototype, "getUserByEmail").mockResolvedValue(null);
      jest.spyOn(User.prototype, "register").mockResolvedValue(null);

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(new Error("Database error"));
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
