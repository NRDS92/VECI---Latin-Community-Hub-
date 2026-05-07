import { Router } from "express";
import * as authController from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";


const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleLogin);
router.get("/verify/:token", authController.verifyEmail);
router.delete("/me",authMiddleware, authController.deleteAccount);



export default router;