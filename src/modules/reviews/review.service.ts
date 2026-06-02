import prisma from "../../config/database";
import { getPagination, getPaginationMeta } from "../../utils/pagination";

export const getProductReviews = async (
    productId: string,
    query: { page?: string; limit?: string }
) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });
    if (!product) throw { status: 404, message: "Product not found" };

    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const { take, skip } = getPagination(page, limit);

    const where = { productId };

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where,
            include: {
                user: { omit: { password: true } },
            },
            orderBy: { createdAt: "desc" },
            take,
            skip,
        }),
        prisma.review.count({ where }),
    ]);

    const avgResult = await prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
    });

    const avgRating = avgResult._avg.rating
        ? Math.round(avgResult._avg.rating * 10) / 10
        : 0;

    return {
        avgRating,
        totalReviews: total,
        reviews,
        meta: getPaginationMeta(total, page, limit),
    };
};

export const createReview = async (
    productId: string,
    userId: string,
    data: { rating: number; comment?: string }
) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });
    if (!product) throw { status: 404, message: "Product not found" };

    const existingReview = await prisma.review.findUnique({
        where: { productId_userId: { productId, userId } },
    });
    if (existingReview) {
        throw { status: 409, message: "You have already reviewed this product" };
    }

    const review = await prisma.review.create({
        data: {
            rating: data.rating,
            comment: data.comment,
            productId,
            userId,
        },
        include: {
            user: { omit: { password: true } },
        },
    });

    return review;
};

export const updateReview = async (
    reviewId: string,
    userId: string,
    data: { rating?: number; comment?: string }
) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });
    if (!review) throw { status: 404, message: "Review not found" };

    if (review.userId !== userId) {
        throw { status: 403, message: "You can only edit your own review" };
    }

    const updated = await prisma.review.update({
        where: { id: reviewId },
        data: {
            ...(data.rating !== undefined && { rating: data.rating }),
            ...(data.comment !== undefined && { comment: data.comment }),
        },
        include: {
            user: { omit: { password: true } },
        },
    });

    return updated;
};

export const getLatestReviews = async (
    query: { page?: string; limit?: string }
) => {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const { take, skip } = getPagination(page, limit);

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            include: {
                user: { omit: { password: true } },
                product: {
                    select: { id: true, name: true, slug: true },
                },
            },
            orderBy: { createdAt: "desc" },
            take,
            skip,
        }),
        prisma.review.count(),
    ]);

    const avgResult = await prisma.review.aggregate({
        _avg: { rating: true },
    });

    return {
        avgRating: avgResult._avg.rating
            ? Math.round(avgResult._avg.rating * 10) / 10
            : 0,
        totalReviews: total,
        reviews,
        meta: getPaginationMeta(total, page, limit),
    };
};

export const deleteReview = async (
    reviewId: string,
    userId: string,
    userRole: string
) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });
    if (!review) throw { status: 404, message: "Review not found" };

    if (review.userId !== userId && userRole !== "ADMIN") {
        throw { status: 403, message: "You can only delete your own review" };
    }

    await prisma.review.delete({ where: { id: reviewId } });

    return { message: "Review deleted successfully" };
};
