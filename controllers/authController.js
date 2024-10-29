import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../services/User.js";

export class AuthController {

  constructor() {
    this.userService = new User();
  }

  async login(req, res, next) {
    const { email, password } = req.body;    

    try {
      const user = await this.userService.getUserByEmail(email);

      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user.id }, 
        process.env.JWT_SECRET_KEY, 
        { expiresIn: "72h" }
      );

      const userWithToken = {
        ...user,
        token
      }

      res.status(200).json({ 
        message: "Success login",
        data: userWithToken
      });

    } catch (error) {
      next(error)
    }
  }

  async register(req, res, next) {
    try {
      
      const { error: joiError } = this.user.validateUser(req.body);
      
      if (joiError) return next(joiError);             

      const { email, password } = req.body;
      const user = await this.userService.getUserByEmail(email);

      if (user) {
        return res.status(409).json({ message: "Email already use" })
      }
      
      const userCreated = await this.userService.register(req.body);

      if (userCreated) {
        return res.status(200).json({ message: "success" });
      }
  
    } catch(error) {
      next(error);
    }  
  }

}