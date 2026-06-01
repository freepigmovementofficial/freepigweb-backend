import multer from "multer";
import { sendError } from "../utils/response";
import { Request, Response, NextFunction } from "express";

const storage = multer.memoryStorage();

const fileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const handleUploadError = (
    err: any,
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof multer.MulterError || err.message) {
        return sendError(res, err.message, 400);
    }
    next(err);
};

export const uploadVideo = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ["video/mp4", "video/quicktime", "video/webm"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only MP4, MOV, and WebM videos are allowed"));
        }
    },
});