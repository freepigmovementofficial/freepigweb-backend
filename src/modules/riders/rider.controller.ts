import { Request, Response } from "express";
import {
    getRiders,
    getRiderById,
    createRider,
    updateRider,
    deleteRider,
    uploadRiderImages,
    deleteRiderImage,
    uploadRiderVideo,
    deleteRiderVideo,
} from "./rider.service";
import { sendSuccess, sendError } from "../../utils/response";

export const index = async (req: Request, res: Response) => {
    try {
        const data = await getRiders(req.query as any);
        return sendSuccess(res, data, "Riders fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 500);
    }
};

export const show = async (req: Request, res: Response) => {
    try {
        const rider = await getRiderById(req.params.id as string);
        return sendSuccess(res, rider, "Rider fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 404);
    }
};

export const store = async (req: Request, res: Response) => {
    try {
        const rider = await createRider(req.body);
        return sendSuccess(res, rider, "Rider created successfully", 201);
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const rider = await updateRider(req.params.id as string, req.body);
        return sendSuccess(res, rider, "Rider updated successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const destroy = async (req: Request, res: Response) => {
    try {
        const result = await deleteRider(req.params.id as string);
        return sendSuccess(res, result, "Rider deleted successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const uploadImages = async (req: Request, res: Response) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return sendError(res, "No images uploaded", 400);
        }
        const images = await uploadRiderImages(
            req.params.id as string,
            req.files
        );
        return sendSuccess(res, images, "Images uploaded successfully", 201);
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const destroyImage = async (req: Request, res: Response) => {
    try {
        const result = await deleteRiderImage(
            req.params.id as string,
            req.params.imageId as string
        );
        return sendSuccess(res, result, "Image deleted successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const uploadVideo = async (req: Request, res: Response) => {
  try {
    if (!req.file) return sendError(res, "No video file uploaded", 400);
    const updated = await uploadRiderVideo(req.params.id as string, req.file);
    return sendSuccess(res, updated, "Rider video uploaded successfully");
  } catch (err: any) {
    return sendError(res, err.message, err.status || 400);
  }
};

export const destroyVideo = async (req: Request, res: Response) => {
  try {
    const result = await deleteRiderVideo(req.params.id as string);
    return sendSuccess(res, result, "Rider video deleted successfully");
  } catch (err: any) {
    return sendError(res, err.message, err.status || 400);
  }
};