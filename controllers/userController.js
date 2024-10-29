import User from "../services/User.js";

class UserController {

  constructor() {
    this.user = new User();
  }

  async createUser(req, res, next) {
    try {

      const { error } = this.user.validateUser(req.body);
  
      if (error) {
        next(error);
        return;
      }
     
      const user = await this.user.createUser(req.body);

      if (user) {
        res.status(200).json({ message: "success" });
      }
  
    } catch(error) {
      next(error);
    }  
  }

  async getUsers(req, res, next) {
    try {

      const users = await this.user.getUsers();

      res.json(users);
    } catch(error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await this.user.getUserById(req.params);

      // if user id not found
      if (user.length == 0) {      
        return res.status(404).json({
          message: "User ID not found!"
        });
      }
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      
      const userId = parseInt(req.params.id);
      const userAfterUpdate = await this.user.updateUser(userId, req.body);
    

      if (userAfterUpdate) {
        res.json({ message: "success" });
      }

    } catch (error) {
      next(error);
    }
  }

}

export default UserController;