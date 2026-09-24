import { Router } from "express";

import { upload } from "../../middleware/upload.middleware";
import { uploadImage } from "./upload.service";

import { authMiddleware } from "../../middleware/auth.middleware";

import fs from "fs-extra";

const router = Router();

router.post(
    "/",
    authMiddleware,
    upload.single("image"),
    async (req, res, next) => {
        console.log("📸 Upload request received");

        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        try {
            const imageUrl = await uploadImage(file.path);

            return res.json({
                success: true,
                data: imageUrl,
            });
        } catch (error) {
            next(error);
        } finally {
            await fs.remove(file.path);
        }
    }
);

export default router;