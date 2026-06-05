import { Request, Response } from "express";
import {
    getActiveTestimonials,
    getAllTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    uploadTestimonialPhoto,
    toggleTestimonialActive,
} from "./testimonial.service";
import { sendSuccess, sendError } from "../../utils/response";

export const index = async (req: Request, res: Response) => {
    try {
        const data = await getActiveTestimonials(req.query as any);
        return sendSuccess(res, data, "Testimonials fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 500);
    }
};

export const getAll = async (req: Request, res: Response) => {
    try {
        const data = await getAllTestimonials(req.query as any);
        return sendSuccess(res, data, "All testimonials fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 500);
    }
};

export const store = async (req: Request, res: Response) => {
    try {
        const testimonial = await createTestimonial(req.body);
        return sendSuccess(res, testimonial, "Testimonial created successfully", 201);
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const testimonial = await updateTestimonial(req.params.id as string, req.body);
        return sendSuccess(res, testimonial, "Testimonial updated successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const destroy = async (req: Request, res: Response) => {
    try {
        const result = await deleteTestimonial(req.params.id as string);
        return sendSuccess(res, result, "Testimonial deleted successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const uploadPhoto = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return sendError(res, "No photo file uploaded", 400);
        }
        const updated = await uploadTestimonialPhoto(req.params.id as string, req.file);
        return sendSuccess(res, updated, "Testimonial photo uploaded successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const toggleActive = async (req: Request, res: Response) => {
    try {
        const updated = await toggleTestimonialActive(req.params.id as string);
        return sendSuccess(res, updated, "Testimonial status toggled successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};
