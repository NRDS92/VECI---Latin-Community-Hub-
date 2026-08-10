import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { User } from "../modules/users/user.model";
import { AppError } from "../shared/errors/AppError";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const authMiddleware = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {

    try {

        const authHeader =
            req.headers.authorization;

        // No Authorization header
        if (!authHeader) {

            return next(
                new AppError(
                    "No token provided",
                    401,
                    "NO_TOKEN"
                )
            );

        }

        // Invalid format
        if (!authHeader.startsWith("Bearer ")) {

            return next(
                new AppError(
                    "Invalid token format",
                    401,
                    "INVALID_TOKEN_FORMAT"
                )
            );

        }

        const token =
            authHeader.split(" ")[1];

        if (!token) {

            return next(
                new AppError(
                    "Token missing",
                    401,
                    "NO_TOKEN"
                )
            );

        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            JWT_SECRET
        ) as {
            userId: string;
        };

        // Find user
        const user =
            await User.findById(decoded.userId);

        if (!user) {

            return next(
                new AppError(
                    "User not found",
                    401,
                    "USER_NOT_FOUND"
                )
            );

        }

        // Attach authenticated user
        (req as any).user = user;

        next();

    } catch (error: any) {

        if (
            error.name ===
            "TokenExpiredError"
        ) {

            return next(
                new AppError(
                    "Token expired",
                    401,
                    "TOKEN_EXPIRED"
                )
            );

        }

        return next(
            new AppError(
                "Invalid token",
                401,
                "INVALID_TOKEN"
            )
        );

    }

};