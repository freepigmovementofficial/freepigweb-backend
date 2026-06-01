import { Request, Response } from "express";
import {
    createCustomOrder,
    getMyCustomOrders,
    getCustomOrderById,
} from "./custom-order.service";
import { sendSuccess, sendError } from "../../utils/response";

export const store = async (req: Request, res: Response) => {
    try {
        const order = await createCustomOrder(req.user!.id, req.body);
        return sendSuccess(res, order, "Custom order submitted successfully", 201);
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        const data = await getMyCustomOrders(req.user!.id, req.query as any);
        return sendSuccess(res, data, "Custom orders fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 500);
    }
};

export const show = async (req: Request, res: Response) => {
    try {
        const order = await getCustomOrderById(
            req.params.id as string,
            req.user!.id,
            req.user!.role
        );
        return sendSuccess(res, order, "Custom order fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 500);
    }
};
