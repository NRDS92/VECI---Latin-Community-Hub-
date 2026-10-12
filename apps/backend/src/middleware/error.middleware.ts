
import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors/AppError";
import multer from "multer";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isDev = process.env.NODE_ENV === "development";

  const error =
    err instanceof Error
      ? err
      : new Error("Unknown error");

  // Detailed logs only in development.
  if (isDev) {
    console.error("[ERROR]", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    // Avoid logging raw error messages in production.
    console.error("[ERROR]", {
      name: error.name,
    });
  }

  // Application errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
    });
  }

  // Multer upload errors
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File is too large. Maximum size is 5 MB.",
        code: "FILE_TOO_LARGE",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field.",
        code: "UNEXPECTED_FILE",
      });
    }

    return res.status(400).json({
      success: false,
      message: "File upload failed.",
      code: "UPLOAD_ERROR",
    });
  }

  // Mongoose invalid ObjectId
  if (
    error instanceof mongoose.Error.CastError ||
    error.name === "CastError"
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
      code: "INVALID_ID",
    });
  }

  // MongoDB duplicate key
  const mongoError = error as Error & {
    code?: number;
  };

  if (mongoError.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate field value",
      code: "DUPLICATE_ERROR",
    });
  }

  // JWT errors
  if (error instanceof jwt.TokenExpiredError) {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      code: "TOKEN_EXPIRED",
    });
  }

  if (
    error instanceof jwt.JsonWebTokenError ||
    error instanceof jwt.NotBeforeError
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      code: "INVALID_TOKEN",
    });
  }

  // Unexpected errors
  return res.status(500).json({
    success: false,
    message: isDev
      ? error.message
      : "Internal server error",
    code: "INTERNAL_ERROR",
  });
};
