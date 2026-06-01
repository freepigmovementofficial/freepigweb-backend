import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt";
import prisma from "../config/database";
import { sendError } from "../utils/response";

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendError(res, "Unauthorized", 401);
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, jwtConfig.secret) as { id: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            omit: { password: true },
        });

        if (!user) return sendError(res, "Unauthorized", 401);

        req.user = user;
        next();
    } catch {
        return sendError(res, "Unauthorized", 401);
    }
};