import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import ejs from "ejs";
import path from "path";
import User from "../services/User.js";
import sendMail from "../config/mail/mail.js";
import { io } from "../../app.js";

export default class AuthController {

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
      
      const { error: joiError } = this.userService.validateUser(req.body);
      
      if (joiError) return next(joiError);             

      const { email } = req.body;
      const user = await this.userService.getUserByEmail(email);

      if (user) {
        return res.status(409).json({ message: "Email already use" })
      }
      
      const userCreated = await this.userService.register(req.body);

      if (!userCreated) {
        throw new Error("Database error");
      }

      io.emit("notification", { message: "Sukses membuat akun baru" });
      return res.status(200).json({ message: "success", data: userCreated });
    } catch(error) {
      next(error);
    }  
  }

  async forgotPassword(req, res, next) {
    const { email } = req.body;
    
    try {

      const user = await this.userService.getUserByEmail(email);
  
      if (!user) {
        return res.status(400).json({ message: "Email not found!" });
      }
  
      const token = jwt.sign(
        { id: user.id }, 
        process.env.JWT_SECRET_KEY, 
        { expiresIn: "1h" }
      );
  
      const urlResetPassword = `${process.env.BASE_URL}/reset-password?token=${token}`;
  
      const mailHtmlContent = await ejs.renderFile(
        path.join(process.cwd(), "/src/views/emails/forgot-password-mail.ejs"),
        { 
          name: user.name,
          url: urlResetPassword
        }
      );
  
      const mailOptions = {
        from: "nazlahevinbusiness@gmail.com",
        to: email,
        subject: "Reset Password",        
        html: mailHtmlContent,
      };
  
      await sendMail(mailOptions);

      return res.status(200).json({ 
        status: "success",
        message: "Successfully sent email to reset password!"
      });

    } catch (error) {
      next(error);
    }

  }

  async resetPassword(req, res, next) {
    const { password, confirmPassword, token } = req.body;    
    
    if (confirmPassword !== password) {
      return res.status(400).json({message: "confirm password tidak sesuai dengan password"});
    }   
    
    try {
      
      const { id: userId } = jwt.verify(token, process.env.JWT_SECRET_KEY);
  
      const user = await this.userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      } 
      
      const userUpdated = await this.userService.updatePassword(user.id, password);
      
      io.emit("notification", { message: "Sukses mereset password" });

      return res.status(200).json({        
        message: "success reset password",
        data: userUpdated
      });

    } catch (error) {

      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: error.message });
      }

      next(error);
    }
  }

  async forgotPasswordPage(req, res) {
    res.render("forgot-password", { 
      layout: "layouts/main-layout",
      title: "Request Reset Password - Binar Bank Hevin"
    });
  }

  async notificationPage(req, res) {
    res.render("notification", { 
      layout: "layouts/main-layout",
      title: "Pesan Notifikasi - Binar Bank Hevin"
    });
  }

}