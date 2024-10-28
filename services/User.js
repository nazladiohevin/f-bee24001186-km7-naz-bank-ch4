import { PrismaClient } from "@prisma/client";
import Joi from "joi";

class User {

  constructor() {
    this.prisma = new PrismaClient();
    this.userSchema = this._createSchema();     
    this.now = new Date();
  }

  _createSchema() {
    return Joi.object({
      name: Joi.string().min(5).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      identity_type: Joi.string().valid('ktp', 'sim', 'paspor', 'ktm').optional(),
      identity_number: Joi.string().optional(),
      address: Joi.string().optional(),
    });
  }

  validateUser(data) {
    return this.userSchema.validate(data);
  }

  async createUser(data) {  
    const profile = (data.identity_type && data.identity_number) ? {
      create: {
        identityType: data.identity_type,
        identityNumber: data.identity_number,
        address: data.address,
        createdAt: this.now      
      }
    } : undefined;

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        createdAt: this.now,
        profile
      }
    });     
  }

  async getUsers() {    
    return this.prisma.user.findMany();
  }

  async getUserById(params) {         
    return this.prisma.user.findMany({
      where: {
        id: parseInt(params.id),        
      },
      include: { profile: true }
    });
  }

  async updateUser(userId, data) {                     
    // Check availability user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    
    const profile = user.profile ? {      
      update: {
        address: data.address,
        updateAt: this.now
      }      
    } : undefined;

    // Check if address ready and profile null
    if (data.address && profile == undefined) {
      res.status(404).json({ message: "profile empty, please add profile" });
      return;
    }
      
    // Update user and profile
    return this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        name: data.name,
        updateAt: this.now,                 
        profile
      }    
    });    
  }
}

export default User;