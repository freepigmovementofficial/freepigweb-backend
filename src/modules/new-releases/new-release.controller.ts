import { Request, Response } from "express";
import {
    getActiveNewRelease,
    getAllNewReleases,
    createNewRelease,
    updateNewRelease,
    deleteNewRelease,
    uploadNewReleaseVideo,
    toggleNewReleaseActive,
    uploadNewReleaseImages,
    deleteNewReleaseImage,
} from "./new-release.service";
import { sendSuccess, sendError } from "../../utils/response";

export const getActive = async (req: Request, res: Response) => {
    try {
        const active = await getActiveNewRelease();
        return sendSuccess(res, active, "Active new release fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 404);
    }
};

export const index = async (req: Request, res: Response) => {
    try {
        const data = await getAllNewReleases();
        return sendSuccess(res, data, "New releases fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const store = async (req: Request, res: Response) => {
    try {
        const newRelease = await createNewRelease(req.body);
        return sendSuccess(res, newRelease, "New release created successfully", 201);
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const updated = await updateNewRelease(req.params.id as string, req.body);
        return sendSuccess(res, updated, "New release updated successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const destroy = async (req: Request, res: Response) => {
    try {
        const result = await deleteNewRelease(req.params.id as string);
        return sendSuccess(res, result, "New release deleted successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const uploadVideo = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return sendError(res, "No video file uploaded", 400);
        }
        const updated = await uploadNewReleaseVideo(req.params.id as string, req.file);
        return sendSuccess(res, updated, "Video uploaded successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const toggle = async (req: Request, res: Response) => {
    try {
        const updated = await toggleNewReleaseActive(req.params.id as string);
        const message = updated.isActive
            ? "New release activated successfully"
            : "New release deactivated successfully";
        return sendSuccess(res, updated, message);
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const uploadImages = async (req: Request, res: Response) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return sendError(res, "No images uploaded", 400);
        }
        const images = await uploadNewReleaseImages(req.params.id as string, req.files);
        return sendSuccess(res, images, "Images uploaded successfully", 201);
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const destroyImage = async (req: Request, res: Response) => {
    try {
        const result = await deleteNewReleaseImage(req.params.id as string, req.params.imageId as string);
        return sendSuccess(res, result, "Image deleted successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};