import express from "express";

import {
  registerUser,
  login,
  logout,
  refresh,
  getMe,
} from "../controllers/auth.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);

router.get("/get-me", authUser, getMe);

export default router;
