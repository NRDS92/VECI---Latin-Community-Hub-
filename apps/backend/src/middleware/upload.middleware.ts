import multer from "multer";
import path from "path";
import fs from "fs-extra";
import { AppError } from "../shared/errors/AppError";

const uploadDirectory = "uploads";

fs.ensureDirSync(uploadDirectory);

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (_req, file, cb) => {
        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        const uniqueName = `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}${extension}`;

        cb(null, uniqueName);
    },
});

/*
 * IMAGE UPLOAD
 */

const imageFileFilter: multer.Options["fileFilter"] = (
    _req,
    file,
    cb
) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    ];

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    const isValidMimeType =
        allowedMimeTypes.includes(file.mimetype);

    const isValidExtension =
        allowedExtensions.includes(extension);

    if (!isValidMimeType || !isValidExtension) {
        return cb(
            new AppError(
                "Invalid image type. Allowed types: JPG, JPEG, PNG and WEBP.",
                400,
                "INVALID_FILE_TYPE"
            )
        );
    }

    cb(null, true);
};

export const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024,
    },

    fileFilter: imageFileFilter,
});

/*
 * PDF UPLOAD
 */

const pdfFileFilter: multer.Options["fileFilter"] = (
    _req,
    file,
    cb
) => {
    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    const isValidMimeType =
        file.mimetype === "application/pdf";

    const isValidExtension =
        extension === ".pdf";

    if (!isValidMimeType || !isValidExtension) {
        return cb(
            new AppError(
                "Invalid PDF file. Only PDF files are allowed.",
                400,
                "INVALID_PDF_TYPE"
            )
        );
    }

    cb(null, true);
};

export const uploadPdfFile = multer({
    storage,

    limits: {
        fileSize: 10 * 1024 * 1024,
    },

    fileFilter: pdfFileFilter,
});