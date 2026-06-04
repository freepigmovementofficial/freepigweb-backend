import { Request, Response } from "express";
import {
    getGalleries,
    createGalleries,
    updateGallery,
    deleteGallery,
} from "./gallery.service";
import { sendSuccess, sendError } from "../../utils/response";

export const index = async (req: Request, res: Response) => {
    try {
        const data = await getGalleries(req.query as any);
        return sendSuccess(res, data, "Gallery fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 500);
    }
};

export const store = async (req: Request, res: Response) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return sendError(res, "No images uploaded", 400);
        }
        const galleries = await createGalleries(req.files);
        return sendSuccess(res, galleries, "Gallery uploaded successfully", 201);
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const gallery = await updateGallery(req.params.id as string, req.body);
        return sendSuccess(res, gallery, "Gallery updated successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const destroy = async (req: Request, res: Response) => {
    try {
        const result = await deleteGallery(req.params.id as string);
        return sendSuccess(res, result, "Gallery deleted successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};
