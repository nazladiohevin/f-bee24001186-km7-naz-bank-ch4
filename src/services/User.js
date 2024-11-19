import { PrismaClient } from "@prisma/client";
import Joi from "joi";
import bcrypt from "bcrypt";

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

  async getUserByEmail(email){
    return this.prisma.user.findUnique({
      where: { email }
    });  
  };

  async register(data) {  
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
    const password = await bcrypt.hash(data.password, saltRounds);

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password,
        createdAt: this.now,        
      }
    });     
  }


  async getUsers() {    
    return this.prisma.user.findMany();
  }

  async getUserById(id) {  
    const userId = parseInt(id);    
    
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });
  }

  async updateUser(userId, data) {                         
    return this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        name: data.name,
        updateAt: this.now,                         
      }    
    });    
  }

  async updatePassword(userId, password){
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
    const hashPassword = await bcrypt.hash(password, saltRounds);

    return this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        password: hashPassword,
        updateAt: this.now
      }
    })
  }
}

export default User;