import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const optionalAuthMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) return next();

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    (req as any).user = {
      id: decoded.userId,
    };

    next();
  } catch (error) {
    // 🔥 no bloquea si falla
    next();
  }
};