import jwt from "jsonwebtoken";
import User from "../services/User.js";

export async function isAuthorized(req, res, next) {
  const userService = new User();

  const authorization = req.get("authorization");

  if (!authorization) {
    return res.status(401).json({ message: "Missing authorization header" });    
  }

  const [type, token] = authorization.split(" ");
    
  if (type.toLocaleLowerCase() !== "bearer") {
    return res.status(401).json({ message: "Invalid authorization type" });
  }

  
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    const user = userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.locals.user = user;
    next();

  } catch (error) {

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: error.message });
    }

    next(error)
  }
}