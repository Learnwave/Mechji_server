import express from "express";
import { isAuthenticated, Login, logout, register, resetPassword, sentResetOtp, sentVerifyOtp, verifyEmail, verifyOtp } from "../controller/authController.js";
import userAuth from "../Middleware/userAuth.js";
const authRouter = express.Router();

authRouter.post("/register",register);
authRouter.post("/login",Login);
authRouter.post("/logout",logout);
authRouter.post("/send-verify-otp",userAuth,sentVerifyOtp);
authRouter.post("/verify-account",userAuth,verifyEmail);
authRouter.get("/isAuth",userAuth,isAuthenticated);
authRouter.post("/send-reset-otp",sentResetOtp);
authRouter.post("/reset-password",resetPassword);
authRouter.post("/verify-otp",verifyOtp);

export default authRouter;
