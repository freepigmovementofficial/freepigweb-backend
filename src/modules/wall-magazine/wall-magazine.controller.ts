import { Request, Response } from "express";
import {
    getActiveWallMagazine,
    getAllWallMagazines,
    createWallMagazine,
    updateWallMagazine,
    deleteWallMagazine,
    uploadWallMagazineImage,
    toggleWallMagazineActive,
} from "./wall-magazine.service";
import { sendSuccess, sendError } from "../../utils/response";

export const getActive = async (req: Request, res: Response) => {
    try {
        const data = await getActiveWallMagazine();
        return sendSuccess(res, data, "Active wall magazine fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const index = async (req: Request, res: Response) => {
    try {
        const data = await getAllWallMagazines();
        return sendSuccess(res, data, "Wall magazines fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const store = async (req: Request, res: Response) => {
    try {
        const data = await createWallMagazine(req.body);
        return sendSuccess(res, data, "Wall magazine created successfully", 201);
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const data = await updateWallMagazine(req.params.id as string, req.body);
        return sendSuccess(res, data, "Wall magazine updated successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const destroy = async (req: Request, res: Response) => {
    try {
        const data = await deleteWallMagazine(req.params.id as string);
        return sendSuccess(res, data, "Wall magazine deleted successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const uploadImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return sendError(res, "No image file uploaded", 400);
        }
        const data = await uploadWallMagazineImage(req.params.id as string, req.file);
        return sendSuccess(res, data, "Image uploaded successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const toggle = async (req: Request, res: Response) => {
    try {
        const data = await toggleWallMagazineActive(req.params.id as string);
        return sendSuccess(res, data, "Wall magazine status toggled successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};
