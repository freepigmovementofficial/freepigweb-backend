import { Request, Response } from "express";
import {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    getLatestReviews,
} from "./review.service";
import { sendSuccess, sendError } from "../../utils/response";

export const latest = async (req: Request, res: Response) => {
    try {
        const data = await getLatestReviews(req.query as any);
        return sendSuccess(res, data, "Latest reviews fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const index = async (req: Request, res: Response) => {
    try {
        const data = await getProductReviews(
            req.params.productId as string,
            req.query as any
        );
        return sendSuccess(res, data, "Reviews fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const store = async (req: Request, res: Response) => {
    try {
        const review = await createReview(
            req.params.productId as string,
            req.user!.id,
            req.body
        );
        return sendSuccess(res, review, "Review created successfully", 201);
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const review = await updateReview(
            req.params.id as string,
            req.user!.id,
            req.body
        );
        return sendSuccess(res, review, "Review updated successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const destroy = async (req: Request, res: Response) => {
    try {
        const result = await deleteReview(
            req.params.id as string,
            req.user!.id,
            req.user!.role
        );
        return sendSuccess(res, result, "Review deleted successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};
