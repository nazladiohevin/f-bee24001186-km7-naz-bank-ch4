import Joi from "joi";
import User from "../services/User.js";
import Profile from "../services/Profile.js";
import manageImage from "../libs/imagekit.js"

class UserController {

  constructor() {
    this.userService = new User();
    this.profileService = new Profile();
  }

  _validateFile(req, res){
    const fileSchema = Joi.object({
      mimetype: Joi.string().valid('image/png', 'image/jpg', 'image/jpeg'),
      size: Joi.number().max(2 * 1024 * 1024)
    });
  
    const { error: fileError } = fileSchema.validate({
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    return fileError;
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
    const { error: joiError } = this.profileService.validateUserProfile(req.body);

    if (joiError) return next(joiError);  

    try {
      const { id: userId } = req.params;
      
      const userProfile = await this.profileService.getProfileByUserId(userId);
      
      if (userProfile) {
        return res.status(400).json({ message: "Profile has been created" });
      }

      if (req.file) {
        const fileError = this._validateFile(req, res);

        if (fileError) {
          return res.status(400).json({ message: "Invalid file type or size. Please use .png, .jpg, or .jpeg file" });
        }
      }

      const fileUploaded = await manageImage.uploadImage(req);      

      const data = {
        ...req.body,
        avatarUrl: fileUploaded.url,
        avatarName: fileUploaded.name,
        avatarId: fileUploaded.fileId
      }

      const profile = await this.profileService.createUserProfile(userId, data);

      if (!profile) {
        throw new Error("Database Error");
      }

      res.status(200).json({ message: "success", data: profile });

    } catch (error) {
      next(error);
    }
  }

  async updateUserProfile(req, res, next) {
    const { id: userId } = req.params;
    
    try {      
      const userProfile = await this.profileService.getProfileByUserId(userId);
  
      if (!userProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
  
      let fileUploaded = null;    

      // if there file to upload
      if (req.file) {        

        const fileError = this._validateFile(req, res);

        if (fileError) {
          return res.status(400).json({ message: "Invalid file type or size. Please use .png, .jpg, or .jpeg file" });
        }

        if (userProfile.avatarId) {
          const avatarId = userProfile.avatarId;
          await manageImage.deleteImage(avatarId);
        }
  
        // upload new avatar
        fileUploaded = await manageImage.uploadImage(req);
      }
    
      const dataSent = {
        identityType: req.body.identityType || userProfile.identityType,
        identityNumber: req.body.identityNumber || userProfile.identityNumber,
        avatarId: fileUploaded ? fileUploaded.fileId : userProfile.avatarId,
        avatarName: fileUploaded ? fileUploaded.name : userProfile.avatarName,
        avatarUrl: fileUploaded ? fileUploaded.url : userProfile.avatarUrl
      };
        
      const updatedProfile = await this.profileService.updateUserProfile(userId, dataSent);
        
      res.status(200).json({ message: "Profile updated successfully", profile: updatedProfile });
    } catch (error) {
      next(error);
    }
  }
  

  async deleteAvatarUserProfile(req, res, next) {
    const { id: userId } = req.params;

    try {
      const userProfile = await this.profileService.getProfileByUserId(userId);

      if (!userProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
  
      const avatarId = userProfile.avatarId;
      await manageImage.deleteImage(avatarId);

      const dataSent = {
        identityType: req.body.identityType || userProfile.identityType,
        identityNumber: req.body.identityNumber || userProfile.identityNumber,
        avatarId: null,
        avatarName: null,
        avatarUrl: null
      };
      const profileAfterUpdate = await this.profileService.updateUserProfile(userId, dataSent);

      res.status(200).json({ message: "success delete avatar", profile: profileAfterUpdate });

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