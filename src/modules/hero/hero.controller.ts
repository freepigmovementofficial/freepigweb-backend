import { Request, Response } from "express";
import {
    getActiveHeroSection,
    getAllHeroSections,
    createHeroSection,
    updateHeroSection,
    deleteHeroSection,
    uploadHeroVideo,
    toggleHeroActive,
} from "./hero.service";
import { sendSuccess, sendError } from "../../utils/response";

export const getActive = async (req: Request, res: Response) => {
    try {
        const active = await getActiveHeroSection();
        return sendSuccess(res, active, "Active hero section fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 404);
    }
};

export const index = async (req: Request, res: Response) => {
    try {
        const data = await getAllHeroSections();
        return sendSuccess(res, data, "Hero sections fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const store = async (req: Request, res: Response) => {
    try {
        const heroSection = await createHeroSection(req.body);
        return sendSuccess(res, heroSection, "Hero section created successfully", 201);
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const updated = await updateHeroSection(req.params.id as string, req.body);
        return sendSuccess(res, updated, "Hero section updated successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const destroy = async (req: Request, res: Response) => {
    try {
        const result = await deleteHeroSection(req.params.id as string);
        return sendSuccess(res, result, "Hero section deleted successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const uploadVideo = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return sendError(res, "No video file uploaded", 400);
        }
        const updated = await uploadHeroVideo(req.params.id as string, req.file);
        return sendSuccess(res, updated, "Video uploaded successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const toggle = async (req: Request, res: Response) => {
    try {
        const updated = await toggleHeroActive(req.params.id as string);
        const message = updated.isActive
            ? "Hero section activated successfully"
            : "Hero section deactivated successfully";
        return sendSuccess(res, updated, message);
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};
