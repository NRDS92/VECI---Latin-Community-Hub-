import { Request, Response, NextFunction } from "express";

import { AppError } from "../shared/errors/AppError";

export const requireAdmin = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {

    const user = (req as any).user;



    if (!user) {
        console.log("✅ requireAdmin",user);
        return next(
            new AppError(
                "Authentication required.",
                401,
                "UNAUTHORIZED"
            )
        );

    }

    if (user.role !== "admin") {

        return next(
            new AppError(
                "Administrator access required.",
                403,
                "FORBIDDEN"
            )
        );

    }

    next();

};