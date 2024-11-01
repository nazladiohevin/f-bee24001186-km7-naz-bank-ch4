import User from "../services/User.js";

class UserController {

  constructor() {
    this.userService = new User();
  }

  async getUsers(req, res, next) {
    try {

      const users = await this.userService.getUsers();

      res.status(200).json(users);
    } catch(error) {
      next(error);
    }
  }

  async createUserProfile(req, res, next) {
    try {
      const { id: userId } = req.params;
      
      const userProfile = await this.userService.getProfileByUserId(userId);
      
      if (userProfile) {
        return res.status(400).json({ message: "Profile has been created" });
      }

      const profile = await this.userService.createUserProfile(userId, req.body);

      if (!profile) {
        throw new Error("Database Error");
      }

      res.status(200).json({ message: "success", data: profile });

    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await this.userService.getUserById(req.params.id);

      // if user id not found
      if (!user) {      
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

      const user = await this.userService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userAfterUpdate = await this.userService.updateUser(userId, req.body);    

      if (userAfterUpdate) {
        res.json({ message: "success", data: userAfterUpdate });
      }

    } catch (error) {
      next(error);
    }
  }

}

export default UserController;