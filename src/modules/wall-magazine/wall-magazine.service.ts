import prisma from "../../config/database";
import cloudinary from "../../config/cloudinary";

export const getActiveWallMagazine = async () => {
    const active = await prisma.wallMagazine.findFirst({
        where: { isActive: true },
    });
    if (!active) throw { status: 404, message: "No active wall magazine found" };
    return active;
};

export const getAllWallMagazines = async () => {
    return prisma.wallMagazine.findMany({
        orderBy: { createdAt: "desc" },
    });
};

export const createWallMagazine = async (data: {
    title: string;
    description: string;
    buttonText?: string;
    buttonLink?: string;
    isActive?: boolean;
}) => {
    const isActive = data.isActive ?? false;

    if (isActive) {
        await prisma.wallMagazine.updateMany({
            where: { isActive: true },
            data: { isActive: false },
        });
    }

    return prisma.wallMagazine.create({
        data: {
            title: data.title,
            description: data.description,
            buttonText: data.buttonText || null,
            buttonLink: data.buttonLink || null,
            isActive,
        },
    });
};

export const updateWallMagazine = async (
    id: string,
    data: {
        title?: string;
        description?: string;
        buttonText?: string | null;
        buttonLink?: string | null;
    }
) => {
    const existing = await prisma.wallMagazine.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "Wall magazine not found" };

    return prisma.wallMagazine.update({
        where: { id },
        data,
    });
};

export const deleteWallMagazine = async (id: string) => {
    const existing = await prisma.wallMagazine.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "Wall magazine not found" };

    if (existing.imageUrl && existing.imageUrl.includes("cloudinary.com")) {
        try {
            const urlParts = existing.imageUrl.split("/");
            const fileName = urlParts[urlParts.length - 1].split(".")[0];
            const folder = urlParts.slice(-3, -1).join("/");
            const publicId = `${folder}/${fileName}`;
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error("Failed to delete image from Cloudinary:", err);
        }
    }

    await prisma.wallMagazine.delete({ where: { id } });
    return { message: "Wall magazine deleted successfully" };
};

export const uploadWallMagazineImage = async (id: string, file: Express.Multer.File) => {
    const existing = await prisma.wallMagazine.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "Wall magazine not found" };

    if (existing.imageUrl && existing.imageUrl.includes("cloudinary.com")) {
        try {
            const urlParts = existing.imageUrl.split("/");
            const fileName = urlParts[urlParts.length - 1].split(".")[0];
            const folder = urlParts.slice(-3, -1).join("/");
            const publicId = `${folder}/${fileName}`;
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error("Failed to delete old image:", err);
        }
    }

    const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "surf-store/wall-magazine", resource_type: "image" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(file.buffer);
    });

    return prisma.wallMagazine.update({
        where: { id },
        data: { imageUrl: result.secure_url },
    });
};

export const toggleWallMagazineActive = async (id: string) => {
    const existing = await prisma.wallMagazine.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: "Wall magazine not found" };

    const newStatus = !existing.isActive;

    if (newStatus) {
        await prisma.wallMagazine.updateMany({
            where: { id: { not: id }, isActive: true },
            data: { isActive: false },
        });
    }

    return prisma.wallMagazine.update({
        where: { id },
        data: { isActive: newStatus },
    });
};
