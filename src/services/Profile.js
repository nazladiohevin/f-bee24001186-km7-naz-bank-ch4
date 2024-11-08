import { PrismaClient } from "@prisma/client";
import Joi from "joi";

export default class Profile {
  constructor() {
    this.prisma = new PrismaClient();
    this.profileSchema = this._createSchema();         
  }

  _createSchema() {
    return Joi.object({   
      identityType: Joi.string().valid('ktp', 'sim', 'paspor', 'ktm').required(),
      identityNumber: Joi.string().required(),
      address: Joi.string().optional(),    
    });
  }

  
  validateUserProfile(data) {
    return this.profileSchema.validate(data);
  }

  async createUserProfile(userId, data) {
    userId = parseInt(userId);

    return this.prisma.profile.create({
      data: {
        userId,
        identityType: data.identityType,
        identityNumber: data.identityNumber,
        avatarUrl: data.avatarUrl,
        avatarName: data.avatarName,
        avatarId: data.avatarId,
        createdAt: new Date()
      }
    });
  }

  async updateUserProfile(userId, data){
    userId = parseInt(userId);
    
    return this.prisma.profile.update({
      where: { userId },
      data: {
        identityType: data.identityType,        
        identityNumber: data.identityNumber,        
        avatarId: data.avatarId,
        avatarName: data.avatarName,
        avatarUrl: data.avatarUrl,
        updateAt: new Date()
      }
    });
  }

  async getProfileByUserId(userId) {
    return this.prisma.profile.findUnique({
      where: { userId: parseInt(userId) }
    });
  }
}