import { Router } from "express";

import {
    upload,
    uploadPdfFile,
} from "../../middleware/upload.middleware";

import {
    uploadImage,
    uploadPdf,
} from "./upload.service";

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

router.post(
    "/document",
    authMiddleware,
    uploadPdfFile.single("document"),
    async (req, res, next) => {
        console.log("📄 Document upload request received");

        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No document uploaded",
            });
        }

        try {
            const result = await uploadPdf(file.path);

            return res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        } finally {
            await fs.remove(file.path);
        }
    }
);

export default router;