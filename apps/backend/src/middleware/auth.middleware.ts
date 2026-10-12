
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { User } from "../modules/users/user.model";
import { AppError } from "../shared/errors/AppError";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured");
}

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(
        new AppError("No token provided", 401, "NO_TOKEN")
      );
    }

    const [scheme, token, ...extraParts] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token || extraParts.length > 0) {
      return next(
        new AppError(
          "Invalid token format",
          401,
          "INVALID_TOKEN_FORMAT"
        )
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.userId !== "string" ||
      !/^[a-f\d]{24}$/i.test(decoded.userId)
    ) {
      return next(
        new AppError("Invalid token payload", 401, "INVALID_TOKEN")
      );
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(
        new AppError("User not found", 401, "USER_NOT_FOUND")
      );
    }

    if (user.accountStatus === "pending_deletion") {
      return next(
        new AppError(
          "Account deletion is pending",
          403,
          "ACCOUNT_DELETION_PENDING"
        )
      );
    }

    (req as any).user = user;

    return next();
  } catch (error: unknown) {
    if (
      error instanceof jwt.TokenExpiredError
    ) {
      return next(
        new AppError("Token expired", 401, "TOKEN_EXPIRED")
      );
    }

    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.NotBeforeError
    ) {
      return next(
        new AppError("Invalid token", 401, "INVALID_TOKEN")
      );
    }

    // Database or infrastructure errors must reach the
    // centralized error handler instead of becoming HTTP 401.
    return next(error);
  }
};
