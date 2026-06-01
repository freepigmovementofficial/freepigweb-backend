import { Request, Response } from "express";
import {
    getProducts,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    deleteProductImage,
    addProductDimension,
    deleteProductDimension,
} from "./product.service";
import { sendSuccess, sendError } from "../../utils/response";

export const index = async (req: Request, res: Response) => {
    try {
        const data = await getProducts(req.query as any);
        return sendSuccess(res, data, "Products fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, 400);
    }
};

export const show = async (req: Request, res: Response) => {
    try {
        const product = await getProductBySlug(req.params.slug as string);
        return sendSuccess(res, product, "Product fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, 404);
    }
};

export const store = async (req: Request, res: Response) => {
    try {
        const product = await createProduct(req.body);
        return sendSuccess(res, product, "Product created successfully", 201);
    } catch (err: any) {
        return sendError(res, err.message, 400);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const product = await updateProduct(req.params.id as string, req.body);
        return sendSuccess(res, product, "Product updated successfully");
    } catch (err: any) {
        return sendError(res, err.message, 400);
    }
};

export const destroy = async (req: Request, res: Response) => {
    try {
        const result = await deleteProduct(req.params.id as string);
        return sendSuccess(res, result, "Product deleted successfully");
    } catch (err: any) {
        return sendError(res, err.message, 400);
    }
};

export const uploadImages = async (req: Request, res: Response) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return sendError(res, "No images uploaded", 400);
        }

        // types bisa dikirim sebagai array string atau single string
        const types = Array.isArray(req.body.types)
            ? req.body.types
            : req.body.types
                ? [req.body.types]
                : [];

        const images = await uploadProductImages(req.params.id as string, req.files, types);
        return sendSuccess(res, images, "Images uploaded successfully", 201);
    } catch (err: any) {
        return sendError(res, err.message, 400);
    }
};

export const destroyImage = async (req: Request, res: Response) => {
    try {
        const result = await deleteProductImage(req.params.imageId as string);
        return sendSuccess(res, result, "Image deleted successfully");
    } catch (err: any) {
        return sendError(res, err.message, 400);
    }
};

export const addDimension = async (req: Request, res: Response) => {
    try {
        const dimension = await addProductDimension(req.params.id as string, req.body);
        return sendSuccess(res, dimension, "Dimension added successfully", 201);
    } catch (err: any) {
        return sendError(res, err.message, 400);
    }
};

export const destroyDimension = async (req: Request, res: Response) => {
    try {
        const result = await deleteProductDimension(req.params.dimensionId as string);
        return sendSuccess(res, result, "Dimension deleted successfully");
    } catch (err: any) {
        return sendError(res, err.message, 400);
    }
};