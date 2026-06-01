import { Request, Response } from "express";
import {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    getAllCustomOrders,
    updateCustomOrderStatus,
    getAllReviews,
    deleteReview,
} from "./admin.service";
import { sendSuccess, sendError } from "../../utils/response";

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const stats = await getDashboardStats();
        return sendSuccess(res, stats, "Dashboard statistics fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 500);
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const data = await getAllUsers(req.query as any);
        return sendSuccess(res, data, "Users fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 500);
    }
};

export const destroyUser = async (req: Request, res: Response) => {
    try {
        const result = await deleteUser(req.params.id as string);
        return sendSuccess(res, result, "User deleted successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const getCustomOrders = async (req: Request, res: Response) => {
    try {
        const data = await getAllCustomOrders(req.query as any);
        return sendSuccess(res, data, "Custom orders fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 500);
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const order = await updateCustomOrderStatus(
            req.params.id as string,
            req.body.status
        );
        return sendSuccess(res, order, "Custom order status updated successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const getReviews = async (req: Request, res: Response) => {
    try {
        const data = await getAllReviews(req.query as any);
        return sendSuccess(res, data, "Reviews fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 500);
    }
};

export const destroyReview = async (req: Request, res: Response) => {
    try {
        const result = await deleteReview(req.params.id as string);
        return sendSuccess(res, result, "Review deleted successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};
