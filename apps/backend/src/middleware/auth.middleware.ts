import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../shared/errors/AppError";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const authMiddleware = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        // 🔥 NO HEADER
        if (!authHeader) {
        return next(
            new AppError("No token provided", 401, "NO_TOKEN")
        );
        }

        // 🔥 FORMAT CHECK
        if (!authHeader.startsWith("Bearer ")) {
        return next(
            new AppError("Invalid token format", 401, "INVALID_TOKEN_FORMAT")
        );
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
        return next(
            new AppError("Token missing", 401, "NO_TOKEN")
        );
        }

        // 🔥 VERIFY
        const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        };

        // 🔥 ATTACH USER
        (req as any).user = {
        id: decoded.userId,
        };

        next();
    } catch (error: any) {
        // 🔥 TOKEN EXPIRED
        if (error.name === "TokenExpiredError") {
        return next(
            new AppError("Token expired", 401, "TOKEN_EXPIRED")
        );
        }

        // 🔥 INVALID TOKEN
        return next(
        new AppError("Invalid token", 401, "INVALID_TOKEN")
        );
    }
};