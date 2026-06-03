import prisma from "../../config/database";
import { getPagination, getPaginationMeta } from "../../utils/pagination";

export const getStoreReviews = async (
    query: { page?: string; limit?: string },
    userId?: string
) => {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const { take, skip } = getPagination(page, limit);

    const [reviews, total] = await Promise.all([
        prisma.storeReview.findMany({
            include: {
                user: { omit: { password: true } },
            },
            orderBy: { createdAt: "desc" },
            take,
            skip,
        }),
        prisma.storeReview.count(),
    ]);

    const avgResult = await prisma.storeReview.aggregate({
        _avg: { rating: true },
    });

    const avgRating = avgResult._avg.rating
        ? Math.round(avgResult._avg.rating * 10) / 10
        : 0;

    let hasReviewed = false;
    if (userId) {
        const userReview = await prisma.storeReview.findUnique({
            where: { userId },
        });
        hasReviewed = !!userReview;
    }

    return {
        avgRating,
        totalReviews: total,
        hasReviewed,
        reviews,
        meta: getPaginationMeta(total, page, limit),
    };
};

export const createStoreReview = async (
    userId: string,
    data: { rating: number; comment?: string }
) => {
    const existingReview = await prisma.storeReview.findUnique({
        where: { userId },
    });
    if (existingReview) {
        throw { status: 409, message: "You have already reviewed the store" };
    }

    const review = await prisma.storeReview.create({
        data: {
            rating: data.rating,
            comment: data.comment,
            userId,
        },
        include: {
            user: { omit: { password: true } },
        },
    });

    return review;
};

export const updateStoreReview = async (
    reviewId: string,
    userId: string,
    data: { rating?: number; comment?: string }
) => {
    const review = await prisma.storeReview.findUnique({
        where: { id: reviewId },
    });
    if (!review) throw { status: 404, message: "Store review not found" };

    if (review.userId !== userId) {
        throw { status: 403, message: "You can only edit your own store review" };
    }

    const updated = await prisma.storeReview.update({
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

export const deleteStoreReview = async (
    reviewId: string,
    userId: string,
    userRole: string
) => {
    const review = await prisma.storeReview.findUnique({
        where: { id: reviewId },
    });
    if (!review) throw { status: 404, message: "Store review not found" };

    if (review.userId !== userId && userRole !== "ADMIN") {
        throw { status: 403, message: "You can only delete your own store review" };
    }

    await prisma.storeReview.delete({ where: { id: reviewId } });

    return { message: "Store review deleted successfully" };
};
