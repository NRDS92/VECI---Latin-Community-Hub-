import { Router } from "express";
import * as authController from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { forgotPasswordRateLimit, resetPasswordRateLimit } from "../../middleware/auth-rate-limit.middleware";



const router = Router();

router.get(
    "/me",
    authMiddleware,
    authController.getMe
);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleLogin);
router.get("/verify/:token", authController.verifyEmail);
router.delete("/me",authMiddleware, authController.deleteAccount);
router.post("/forgot-password", forgotPasswordRateLimit, authController.forgotPassword);

router.post("/reset-password", resetPasswordRateLimit, authController.resetPassword);
router.patch("/change-password", authMiddleware, authController.changePassword);


export default router;
