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

  async createUser(req, res, next) {
    try {

      const { error } = this.userSchema.validate(req.body);
  
      if (error) {
        next(error);
        return;
      }
  
      const profile = (req.body.identity_type && req.body.identity_number) ? {
        create: {
          identityType: req.body.identity_type,
          identityNumber: req.body.identity_number,
          address: req.body.address,
          createdAt: this.now      
        }
      } : undefined;
  
      let user = await this.prisma.user.create({
        data: {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          createdAt: this.now,
          profile
        }
      });
  
      if (user) {
        res.json({ message: "success" });
      }
  
  
    } catch(error) {
      next(error);
    }  
  }

  async getUsers(req, res, next) {
    try {

      const users = await this.prisma.user.findMany();
      
      res.json(users);
  
    } catch(error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {        
      const users = await this.prisma.user.findMany({
        where: {
          id: parseInt(req.params.id),        
        },
        include: { profile: true }
      });
  
      // if user id not found
      if (users.length == 0) {      
        return res.status(404).json({
          message: "User ID not found!"
        });
      }
      
      res.json(users);
  
    } catch(error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {                 
      const userId = parseInt(req.params.id);

      // Check availability user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      });

      
      const profile = user.profile ? {
        profile: {
          update: {
            address: req.body.address,
            updateAt: this.now
          }
        }
      } : undefined;

      // Check if address ready and profile null
      if (req.body.address && profile == undefined) {
        res.status(404).json({ message: "profile empty, please add profile" });
        return;
      }
       
      // Update user and profile
      const userAfterUpdate = await this.prisma.user.update({
        where: {
          id: parseInt(req.params.id)
        },
        data: {
          name: req.body.name,
          updateAt: this.now,                 
          profile
        }    
      });

      if (userAfterUpdate) {
        res.json({ message: "success" });
      }

    } catch(error) {
      next(error);
    } 
  }
}

export default User;