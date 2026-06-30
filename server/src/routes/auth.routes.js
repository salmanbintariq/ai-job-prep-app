import express from "express";
import { registerUser, login, logout, refresh } from "../controllers/auth.controller.js";


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);

export default router;