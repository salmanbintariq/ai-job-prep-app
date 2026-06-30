import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authUser = async (req, res, next) => {
  // Get the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  // Extract the token from the header
  const token = authHeader.split(" ")[1];

  try {
    // Verify the access token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Find the user and hide sensitive fields
    const user = await User.findById(decoded.id).select("-password -refreshToken");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // Attach the user to the request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
