import { Request, Response } from "express";
import { registerUser, verifyOTP, loginUser, getMe } from "./auth.service";
import { sendSuccess, sendError } from "../../utils/response";

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        const result = await registerUser(name, email, password);
        return sendSuccess(res, result, result.message, 200);
    } catch (err: any) {
        return sendError(res, err.message, 400);
    }
};

export const verify = async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;
        const data = await verifyOTP(email, code);
        return sendSuccess(res, data, "Email verified. Registration complete!", 201);
    } catch (err: any) {
        return sendError(res, err.message, 400);
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const data = await loginUser(email, password);
        return sendSuccess(res, data, "Login successful");
    } catch (err: any) {
        return sendError(res, err.message, 401);
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        const user = await getMe(req.user!.id);
        return sendSuccess(res, user, "User fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, 404);
    }
};