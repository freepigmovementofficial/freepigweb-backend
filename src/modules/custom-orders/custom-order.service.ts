import prisma from "../../config/database";
import { getPagination, getPaginationMeta } from "../../utils/pagination";

const userOmit = { password: true };

export const createCustomOrder = async (
    userId: string,
    data: { name: string; phone: string; location: string; enquiry: string }
) => {
    const order = await prisma.customOrder.create({
        data: {
            name: data.name,
            phone: data.phone,
            location: data.location,
            enquiry: data.enquiry,
            userId,
        },
        include: {
            user: { omit: userOmit },
        },
    });

    return order;
};

export const getMyCustomOrders = async (
    userId: string,
    query: { page?: string; limit?: string }
) => {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const { take, skip } = getPagination(page, limit);

    const where = { userId };

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

export const getCustomOrderById = async (id: string, userId: string, userRole: string) => {
    const order = await prisma.customOrder.findUnique({
        where: { id },
        include: {
            user: { omit: userOmit },
        },
    });

    if (!order) throw { status: 404, message: "Custom order not found" };

    if (order.userId !== userId && userRole !== "ADMIN") {
        throw { status: 403, message: "You can only view your own custom orders" };
    }

    return order;
};
