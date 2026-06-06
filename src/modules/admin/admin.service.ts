import prisma from "../../config/database";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import { CustomOrderStatus } from "@prisma/client";

const userOmit = { password: true };

export const getDashboardStats = async () => {
    const [
        totalSurfboards,
        totalAccessories,
        totalUsers,
        totalRiders,
        totalStoreReviews,
        avgStoreRatingResult,
        totalTestimonials,
        totalGalleries,
        totalFeaturedSections,
        activeNewRelease,
    ] = await Promise.all([
        prisma.product.count({
            where: { isActive: true, productType: "SURFBOARD" },
        }),
        prisma.product.count({
            where: { isActive: true, productType: "ACCESSORY" },
        }),
        prisma.user.count({
            where: { role: "USER" },
        }),
        prisma.rider.count({
            where: { isActive: true },
        }),
        prisma.storeReview.count(),
        prisma.storeReview.aggregate({
            _avg: { rating: true },
        }),
        prisma.testimonial.count({
            where: { isActive: true },
        }),
        prisma.gallery.count(),
        prisma.featuredSection.count(),
        prisma.newRelease.findFirst({
            where: { isActive: true },
            select: { id: true, title: true },
        }),
    ]);

    const avgStore = avgStoreRatingResult._avg.rating ?? 0;
    const avgStoreRating = Math.round(avgStore * 10) / 10;

    return {
        products: {
            totalSurfboards,
            totalAccessories,
            total: totalSurfboards + totalAccessories,
        },
        totalUsers,
        totalRiders,
        storeReviews: {
            total: totalStoreReviews,
            avgRating: avgStoreRating,
        },
        totalTestimonials,
        totalGalleries,
        totalFeaturedSections,
        activeNewRelease: activeNewRelease
            ? { id: activeNewRelease.id, title: activeNewRelease.title }
            : null,
    };
};

export const getAllUsers = async (query: {
    page?: string;
    limit?: string;
    search?: string;
}) => {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const { take, skip } = getPagination(page, limit);

    const where: any = {};

    if (query.search) {
        where.OR = [
            { name: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
        ];
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take,
            skip,
        }),
        prisma.user.count({ where }),
    ]);

    return {
        users,
        meta: getPaginationMeta(total, page, limit),
    };
};

export const deleteUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw { status: 404, message: "User not found" };
    }

    if (user.role === "ADMIN") {
        throw { status: 403, message: "Cannot delete an admin user" };
    }

    await prisma.user.delete({
        where: { id: userId },
    });

    return { message: "User deleted successfully" };
};

export const getAllCustomOrders = async (query: {
    page?: string;
    limit?: string;
    status?: CustomOrderStatus;
}) => {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const { take, skip } = getPagination(page, limit);

    const where: any = {};

    if (query.status) {
        where.status = query.status;
    }

    const [orders, total] = await Promise.all([
        prisma.customOrder.findMany({
            where,
            include: {
                user: { omit: userOmit },
            },
            orderBy: { createdAt: "desc" },
            take,
            skip,
        }),
        prisma.customOrder.count({ where }),
    ]);

    return {
        orders,
        meta: getPaginationMeta(total, page, limit),
    };
};

export const updateCustomOrderStatus = async (
    id: string,
    status: CustomOrderStatus
) => {
    const order = await prisma.customOrder.findUnique({
        where: { id },
    });

    if (!order) {
        throw { status: 404, message: "Custom order not found" };
    }

    const updated = await prisma.customOrder.update({
        where: { id },
        data: { status },
        include: {
            user: { omit: userOmit },
        },
    });

    return updated;
};

export const getAllReviews = async (query: { page?: string; limit?: string }) => {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const { take, skip } = getPagination(page, limit);

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            include: {
                user: { omit: userOmit },
                product: true,
            },
            orderBy: { createdAt: "desc" },
            take,
            skip,
        }),
        prisma.review.count(),
    ]);

    return {
        reviews,
        meta: getPaginationMeta(total, page, limit),
    };
};

export const deleteReview = async (reviewId: string) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review) {
        throw { status: 404, message: "Review not found" };
    }

    await prisma.review.delete({
        where: { id: reviewId },
    });

    return { message: "Review deleted successfully" };
};
