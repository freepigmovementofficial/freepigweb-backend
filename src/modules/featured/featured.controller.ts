import { Request, Response } from "express";
import {
    getActiveFeaturedSection,
    getAllFeaturedSections,
    createFeaturedSection,
    updateFeaturedSection,
    deleteFeaturedSection,
    setFeaturedProducts,
    removeFeaturedProduct,
    toggleFeaturedSectionActive,
} from "./featured.service";
import { sendSuccess, sendError } from "../../utils/response";

export const getActive = async (req: Request, res: Response) => {
    try {
        const active = await getActiveFeaturedSection();
        return sendSuccess(res, active, "Active featured section fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 404);
    }
};

export const index = async (req: Request, res: Response) => {
    try {
        const data = await getAllFeaturedSections();
        return sendSuccess(res, data, "Featured sections fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const store = async (req: Request, res: Response) => {
    try {
        const section = await createFeaturedSection(req.body);
        return sendSuccess(res, section, "Featured section created successfully", 201);
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const updated = await updateFeaturedSection(req.params.id as string, req.body);
        return sendSuccess(res, updated, "Featured section updated successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const destroy = async (req: Request, res: Response) => {
    try {
        const result = await deleteFeaturedSection(req.params.id as string);
        return sendSuccess(res, result, "Featured section deleted successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const setProducts = async (req: Request, res: Response) => {
    try {
        const result = await setFeaturedProducts(
            req.params.id as string,
            req.body.productIds
        );
        return sendSuccess(res, result, "Featured products set successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const removeProduct = async (req: Request, res: Response) => {
    try {
        const result = await removeFeaturedProduct(
            req.params.id as string,
            req.params.productId as string
        );
        return sendSuccess(res, result, "Product removed from featured section");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};

export const toggle = async (req: Request, res: Response) => {
    try {
        const updated = await toggleFeaturedSectionActive(req.params.id as string);
        const message = updated.isActive
            ? "Featured section activated successfully"
            : "Featured section deactivated successfully";
        return sendSuccess(res, updated, message);
    } catch (err: any) {
        return sendError(res, err.message, err.status || 400);
    }
};
