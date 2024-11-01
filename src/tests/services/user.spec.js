import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import User from "../../services/User.js";

jest.unstable_mockModule("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn()
    },
    profile: {
      create: jest.fn(),
      findUnique: jest.fn()
    }
  }))
}));

jest.unstable_mockModule("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

const { PrismaClient: MockPrismaClient } = await import("@prisma/client");

describe("User Service", () => {
  let userService;
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = new MockPrismaClient();
    userService = new User();
    userService.prisma = mockPrisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validateUser", () => {
    it("should validate user data correctly", () => {
      const validData = {
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123456"
      };

      const { error } = userService.validateUser(validData);
      expect(error).toBeUndefined();
    });

    it("should return validation error if data is invalid", () => {
      const invalidData = {
        name: "John",
        email: "invalidemail",
        password: "123"
      };

      const { error } = userService.validateUser(invalidData);
      expect(error).not.toBeUndefined();
    });
  });

  describe("getUserByEmail", () => {
    it("should return user if email exists", async () => {
      const email = "test@example.com";
      const mockUser = { id: 1, email };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const user = await userService.getUserByEmail(email);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(user).toEqual(mockUser);
    });
  });

  describe("register", () => {
    it("should create user", async () => {
      const mockUser = {
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123456",
        createAt: new Date()
      };            

      mockPrisma.user.create.mockResolvedValue(mockUser);

      const user = await userService.register(mockUser);
      
      expect(mockPrisma.user.create).toHaveBeenCalled()
    });
  });

  describe("createUserProfile", () => {
    it("should create profile for user", async () => {
      const userId = 1;
      const profileData = { identityType: "ktp", identityNumber: "123456789" };
      const mockProfile = { id: 1, userId, ...profileData, createdAt: expect.any(Date) };

      mockPrisma.profile.create.mockResolvedValue(mockProfile);

      const profile = await userService.createUserProfile(userId, profileData);

      expect(mockPrisma.profile.create).toHaveBeenCalledWith({
        data: { userId, ...profileData, createdAt: expect.any(Date) }
      });
      expect(profile).toEqual(mockProfile);
    });
  });

  describe("getProfileByUserId", () => {
    it("should return profile for given user ID", async () => {
      const userId = 1;
      const mockProfile = { id: 1, userId, identityType: "ktp", identityNumber: "123456789" };

      mockPrisma.profile.findUnique.mockResolvedValue(mockProfile);

      const profile = await userService.getProfileByUserId(userId);

      expect(mockPrisma.profile.findUnique).toHaveBeenCalledWith({ where: { userId } });
      expect(profile).toEqual(mockProfile);
    });
  });

  describe("getUsers", () => {
    it("should return all users", async () => {
      const mockUsers = [{ id: 1, name: "John Doe" }, { id: 2, name: "Jane Doe" }];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const users = await userService.getUsers();

      expect(mockPrisma.user.findMany).toHaveBeenCalled();
      expect(users).toEqual(mockUsers);
    });
  });

  describe("getUserById", () => {
    it("should return user with profile for given ID", async () => {
      const userId = 1;
      const mockUser = { id: userId, name: "John Doe", profile: { identityType: "ktp", identityNumber: "123456789" } };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const user = await userService.getUserById(userId);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { profile: true }
      });
      expect(user).toEqual(mockUser);
    });
  });

  describe("updateUser", () => {
    it("should update user with new data", async () => {
      const userId = 1;
      const updateData = { name: "new name", address: "new address" };
      const mockUser = { 
        id: userId, 
        name: updateData.name, 
        updateAt: new Date(), 
        profile: { address: updateData.address } ,
        password: "sdsdsdsiiwenwenwinewi"
      };
        
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        createdAt: new Date()
      });

      await userService.updateUser(userId, updateData);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { name: updateData.name, updateAt: userService.now }
      });      
    });
  });
});
