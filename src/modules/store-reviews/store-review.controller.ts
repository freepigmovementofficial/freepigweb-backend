import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../../config/jwt";
import {
    getStoreReviews,
    createStoreReview,
    updateStoreReview,
    deleteStoreReview,
} from "./store-review.service";
import { sendSuccess, sendError } from "../../utils/response";

export const index = async (req: Request, res: Response) => {
    try {
        let userId: string | undefined = undefined;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            try {
                const token = authHeader.split(" ")[1];
                const decoded = jwt.verify(token, jwtConfig.secret) as { id: string };
                userId = decoded.id;
            } catch {
                // If token is invalid or expired, ignore it and treat as guest
            }
        }

        const data = await getStoreReviews(req.query as any, userId);
        return sendSuccess(res, data, "Store reviews fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const store = async (req: Request, res: Response) => {
    try {
        const review = await createStoreReview(
            req.user!.id,
            req.body
        );
        return sendSuccess(res, review, "Store review created successfully", 201);
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const review = await updateStoreReview(
            req.params.id as string,
            req.user!.id,
            req.body
        );
        return sendSuccess(res, review, "Store review updated successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const destroy = async (req: Request, res: Response) => {
    try {
        const result = await deleteStoreReview(
            req.params.id as string,
            req.user!.id,
            req.user!.role
        );
        return sendSuccess(res, result, "Store review deleted successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};
