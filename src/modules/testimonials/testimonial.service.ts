import prisma from "../../config/database";
import cloudinary from "../../config/cloudinary";
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
        testimonials,
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
        testimonials,
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
    return prisma.testimonial.create({
        data: {
            name: data.name,
            review: data.review,
            instagram: data.instagram || null,
            order: data.order ?? 0,
            isActive: data.isActive ?? true,
        },
    });
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

    return prisma.testimonial.update({
        where: { id },
        data: updateData,
    });
};

export const deleteTestimonial = async (id: string) => {
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw { status: 404, message: "Testimonial not found" };

    if (testimonial.photoUrl && testimonial.photoUrl.includes("cloudinary.com")) {
        try {
            const urlParts = testimonial.photoUrl.split("/");
            const fileName = urlParts[urlParts.length - 1].split(".")[0];
            const folder = urlParts.slice(-3, -1).join("/");
            const publicId = `${folder}/${fileName}`;
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error("Failed to delete photo from Cloudinary:", err);
        }
    }

    await prisma.testimonial.delete({ where: { id } });
    return { message: "Testimonial deleted successfully" };
};

export const uploadTestimonialPhoto = async (
    id: string,
    file: Express.Multer.File
) => {
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw { status: 404, message: "Testimonial not found" };

    if (testimonial.photoUrl && testimonial.photoUrl.includes("cloudinary.com")) {
        try {
            const urlParts = testimonial.photoUrl.split("/");
            const fileName = urlParts[urlParts.length - 1].split(".")[0];
            const folder = urlParts.slice(-3, -1).join("/");
            const publicId = `${folder}/${fileName}`;
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error("Failed to delete old photo from Cloudinary:", err);
        }
    }

    const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "surf-store/testimonials",
                resource_type: "image",
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(file.buffer);
    });

    return prisma.testimonial.update({
        where: { id },
        data: { photoUrl: result.secure_url },
    });
};

export const toggleTestimonialActive = async (id: string) => {
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw { status: 404, message: "Testimonial not found" };

    return prisma.testimonial.update({
        where: { id },
        data: { isActive: !testimonial.isActive },
    });
};
