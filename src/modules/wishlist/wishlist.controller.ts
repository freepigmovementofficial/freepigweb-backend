import { Request, Response } from "express";
import { toggleWishlist, getUserWishlists, checkWishlist } from "./wishlist.service";
import { sendSuccess, sendError } from "../../utils/response";

export const toggle = async (req: Request, res: Response) => {
    try {
        const result = await toggleWishlist(
            req.user!.id,
            req.params.productId as string
        );

        const message =
            result.action === "added"
                ? "Product added to wishlist"
                : "Product removed from wishlist";

        return sendSuccess(res, result, message);
    } catch (err: any) {
        return sendError(res, err.message, err.status || 500);
    }
};

export const index = async (req: Request, res: Response) => {
    try {
        const wishlists = await getUserWishlists(req.user!.id);
        return sendSuccess(res, wishlists, "Wishlists fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 500);
    }
};

export const check = async (req: Request, res: Response) => {
    try {
        const result = await checkWishlist(
            req.user!.id,
            req.params.productId as string
        );
        return sendSuccess(res, result, "Wishlist status fetched successfully");
    } catch (err: any) {
        return sendError(res, err.message, err.status || 500);
    }
};
