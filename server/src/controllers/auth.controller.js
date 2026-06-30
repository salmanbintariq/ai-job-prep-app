import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
  cookieOptions,
} from "../utils/token.utils.js";

// ─── Register ───────────────────────────────────────────────────
export async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required to register",
      });
    }

    // Check if the user already exists
    const isUserAlreadyExists = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (isUserAlreadyExists) {
      return res.status(409).json({
        message: "Account already exists...",
      });
    }

    // Create user and issue tokens
    const user = await User.create({ username, email, password });
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save the refresh token to the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // set Cookie
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(201).json({
      success: true,
      message: "user registered successfully",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// ─── Login ───────────────────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if the password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create new tokens for the logged-in user
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save the new refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // set Cookie
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// ─── Logout ─────────────────────────────────────────────────────
export async function logout(req, res) {
  try {
    // Read refresh token from the cookie
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Remove the refresh token from the database
      await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }

    // Clear the cookie from the browser
    res.clearCookie("refreshToken", cookieOptions);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// ─── Refresh Token ──────────────────────────────────────────────
export async function refresh(req, res) {
  try {
    // Read the refresh token from the cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    // Verify the refresh token is valid and not expired
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find the user linked to this token
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Issue a new access token and rotate refresh token
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    // set cookie
    res.cookie("refreshToken", newRefreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
}

export async function getMe(req, res) {
  res.status(200).json({
    success: true,
    user: req.user,
  });
}
