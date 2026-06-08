import prisma from "../../config/database";
import cloudinary from "../../config/cloudinary";

export const getActiveHeroSection = async () => {
    const active = await prisma.heroSection.findFirst({
        where: { isActive: true },
    });

    if (!active) throw { status: 404, message: "No active hero section found" };

    return active;
};

export const getAllHeroSections = async () => {
    return prisma.heroSection.findMany({
        orderBy: { createdAt: "desc" },
    });
};

export const createHeroSection = async (data: {
    title: string;
    subtitle: string;
    description?: string;
    isActive?: boolean;
}) => {
    const isActive = data.isActive ?? false;

    if (isActive) {
        await prisma.heroSection.updateMany({
            where: { isActive: true },
            data: { isActive: false },
        });
    }

    const heroSection = await prisma.heroSection.create({
        data: {
            title: data.title,
            subtitle: data.subtitle,
            description: data.description || null,
            isActive,
        },
    });

    return heroSection;
};

export const updateHeroSection = async (
    id: string,
    data: {
        title?: string;
        subtitle?: string;
        description?: string;
    }
) => {
    const existing = await prisma.heroSection.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "Hero section not found" };

    const updated = await prisma.heroSection.update({
        where: { id },
        data,
    });

    return updated;
};

export const deleteHeroSection = async (id: string) => {
    const existing = await prisma.heroSection.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "Hero section not found" };

    // Hapus video dari Cloudinary jika ada
    if (existing.videoUrl && existing.videoUrl.includes("cloudinary.com")) {
        try {
            const urlParts = existing.videoUrl.split("/");
            const fileName = urlParts[urlParts.length - 1].split(".")[0];
            const folder = urlParts.slice(-3, -1).join("/");
            const publicId = `${folder}/${fileName}`;
            await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
        } catch (err) {
            console.error("Failed to delete video from Cloudinary:", err);
        }
    }

    await prisma.heroSection.delete({ where: { id } });
    return { message: "Hero section deleted successfully" };
};

export const uploadHeroVideo = async (
    id: string,
    file: Express.Multer.File
) => {
    const existing = await prisma.heroSection.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "Hero section not found" };

    // Hapus video lama dari Cloudinary jika ada
    if (existing.videoUrl && existing.videoUrl.includes("cloudinary.com")) {
        try {
            const urlParts = existing.videoUrl.split("/");
            const fileName = urlParts[urlParts.length - 1].split(".")[0];
            const folder = urlParts.slice(-3, -1).join("/");
            const publicId = `${folder}/${fileName}`;
            await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
        } catch (err) {
            console.error("Failed to delete old video:", err);
        }
    }

    // Upload video baru ke Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "surf-store/hero",
                resource_type: "video",
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(file.buffer);
    });

    const updated = await prisma.heroSection.update({
        where: { id },
        data: { videoUrl: result.secure_url },
    });

    return updated;
};

export const toggleHeroActive = async (id: string) => {
    const existing = await prisma.heroSection.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "Hero section not found" };

    const newStatus = !existing.isActive;

    // Hanya boleh satu yang aktif di satu waktu
    if (newStatus) {
        await prisma.heroSection.updateMany({
            where: { id: { not: id }, isActive: true },
            data: { isActive: false },
        });
    }

    const updated = await prisma.heroSection.update({
        where: { id },
        data: { isActive: newStatus },
    });

    return updated;
};
