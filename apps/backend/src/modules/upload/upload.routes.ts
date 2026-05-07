import { Router } from "express";
import { upload } from "../../middleware/upload.middleware";
import { uploadImage } from "../../utils/upload.service";
import fs from "fs-extra";

const router = Router();

router.post("/", upload.single("image"), async (req, res, next) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        // ☁️ subir a cloudinary
        const imageUrl = await uploadImage(file.path);

        // 🧹 borrar archivo local
        await fs.remove(file.path);

        res.json({
            success: true,
            data: imageUrl,
        });
    } catch (err) {
        next(err);
    }
});

export default router;