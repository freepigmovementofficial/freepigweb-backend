import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

export const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return sendError(res, "Forbidden: Admin only", 403);
    }
    next();
};  