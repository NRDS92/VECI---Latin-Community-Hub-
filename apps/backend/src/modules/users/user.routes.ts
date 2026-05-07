import { Router } from "express";
import * as usersController from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/upload.middleware";
import { getFavorites } from "./user.controller";


const router = Router();

router.post(
  "/favorites/:eventId",
  authMiddleware,
  usersController.toggleFavorite
);
router.post(
  "/upload-profile-image",
  authMiddleware,
  upload.single("image"),
  usersController.uploadProfileImage
);
router.post(
  "/me",
  authMiddleware,
  usersController.updateUser
);
router.get(
  "/me",
  authMiddleware,
  usersController.getMe
);
router.get("/favorites", authMiddleware, usersController.getFavorites);
export default router;