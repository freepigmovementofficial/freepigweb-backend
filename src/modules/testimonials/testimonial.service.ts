import prisma from "../../config/database";
import { uploadImage, destroyAsset } from "../../utils/cloudinaryHelper";
import { transformTestimonial } from "../../utils/transformers";
import { getPagination, getPaginationMeta } from "../../utils/pagination";

export const getActiveTestimonials = async (query: { page?: string; limit?: string }) => {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "12");
    const { take, skip } = getPagination(page, limit);

    const where = { isActive: true };

    const [testimonials, total] = await Promise.all([
        prisma.testimonial.findMany({
            where,
            orderBy: { order: "asc" as const },
            take,
            skip,
        }),
        prisma.testimonial.count({ where }),
    ]);

    return {
        testimonials: testimonials.map(transformTestimonial),
        meta: getPaginationMeta(total, page, limit),
    };
};

export const getAllTestimonials = async (query: { page?: string; limit?: string }) => {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "12");
    const { take, skip } = getPagination(page, limit);

    const [testimonials, total] = await Promise.all([
        prisma.testimonial.findMany({
            orderBy: { order: "asc" as const },
            take,
            skip,
        }),
        prisma.testimonial.count(),
    ]);

    return {
        testimonials: testimonials.map(transformTestimonial),
        meta: getPaginationMeta(total, page, limit),
    };
};

export const createTestimonial = async (data: {
    name: string;
    review: string;
    instagram?: string | null;
    order?: number;
    isActive?: boolean;
}) => {
    const result = await prisma.testimonial.create({
        data: {
            name: data.name,
            review: data.review,
            instagram: data.instagram || null,
            order: data.order ?? 0,
            isActive: data.isActive ?? true,
        },
    });
    return transformTestimonial(result);
};

export const updateTestimonial = async (
    id: string,
    data: {
        name?: string;
        review?: string;
        instagram?: string | null;
        order?: number;
        isActive?: boolean;
    }
) => {
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw { status: 404, message: "Testimonial not found" };

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.review !== undefined) updateData.review = data.review;
    if (data.instagram !== undefined) updateData.instagram = data.instagram;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const result = await prisma.testimonial.update({
        where: { id },
        data: updateData,
    });
    return transformTestimonial(result);
};

export const deleteTestimonial = async (id: string) => {
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw { status: 404, message: "Testimonial not found" };

    await destroyAsset(testimonial.photoUrl, "image");
    await prisma.testimonial.delete({ where: { id } });

    return { message: "Testimonial deleted successfully" };
};

export const uploadTestimonialPhoto = async (
    id: string,
    file: Express.Multer.File
) => {
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw { status: 404, message: "Testimonial not found" };

    await destroyAsset(testimonial.photoUrl, "image");

    const result = await uploadImage(file.buffer, "surf-store/testimonials");

    const updated = await prisma.testimonial.update({
        where: { id },
        data: { photoUrl: result.secure_url },
    });
    return transformTestimonial(updated);
};

export const toggleTestimonialActive = async (id: string) => {
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw { status: 404, message: "Testimonial not found" };

    const result = await prisma.testimonial.update({
        where: { id },
        data: { isActive: !testimonial.isActive },
    });
    return transformTestimonial(result);
};
