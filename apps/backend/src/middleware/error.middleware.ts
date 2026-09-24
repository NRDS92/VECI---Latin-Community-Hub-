import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors/AppError";
import multer from "multer";

export const errorMiddleware = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    const isDev = process.env.NODE_ENV === "development";

    // 🔥 LOG
    if (isDev) {
        console.error("🔥 NAME:", err.name);
        console.error("🔥 MESSAGE:", err.message);
        console.error("🔥 STACK:");
        console.error(err.stack);
    } else {
        console.error("🔥 ERROR:", {
            message: err.message,
            code: err.code,
        });
    }

    // ✅ CUSTOM ERROR
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code,
        });
    }

    // 🔥 MULTER
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File is too large. Maximum size is 5 MB.",
                code: "FILE_TOO_LARGE",
            });
        }

        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                message: "Unexpected file field.",
                code: "UNEXPECTED_FILE",
            });
        }

        return res.status(400).json({
            success: false,
            message: err.message,
            code: "UPLOAD_ERROR",
        });
    }

    // 🔥 MONGOOSE
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format",
            code: "INVALID_ID",
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: "Duplicate field value",
            code: "DUPLICATE_ERROR",
        });
    }

    // 🔥 JWT
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
            code: "INVALID_TOKEN",
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token expired",
            code: "TOKEN_EXPIRED",
        });
    }

    // 🔥 DEFAULT
    return res.status(500).json({
        success: false,
        message: isDev ? err.message : "Internal server error",
        code: "INTERNAL_ERROR",
    });
};