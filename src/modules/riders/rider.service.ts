import prisma from "../../config/database";
import cloudinary from "../../config/cloudinary";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import slugify from "slugify";

const riderInclude = {
    images: { orderBy: { order: "asc" as const } },
};

export const getRiders = async (query: { page?: string; limit?: string }) => {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "12");
    const { take, skip } = getPagination(page, limit);

    const where = { isActive: true };

    const [riders, total] = await Promise.all([
        prisma.rider.findMany({
            where,
            include: riderInclude,
            orderBy: { createdAt: "desc" },
            take,
            skip,
        }),
        prisma.rider.count({ where }),
    ]);

    return {
        riders,
        meta: getPaginationMeta(total, page, limit),
    };
};

export const getRiderById = async (id: string) => {
    const rider = await prisma.rider.findUnique({
        where: { id },
        include: riderInclude,
    });

    if (!rider) throw { status: 404, message: "Rider not found" };

    return rider;
};

export const createRider = async (data: {
    name: string;
    location: string;
    bio: string;
}) => {
    const rider = await prisma.rider.create({
        data: {
            name: data.name,
            location: data.location,
            bio: data.bio,
        },
        include: riderInclude,
    });

    return rider;
};

export const updateRider = async (
    id: string,
    data: {
        name?: string;
        location?: string;
        bio?: string;
        isActive?: boolean;
    }
) => {
    const rider = await prisma.rider.findUnique({ where: { id } });
    if (!rider) throw { status: 404, message: "Rider not found" };

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await prisma.rider.update({
        where: { id },
        data: updateData,
        include: riderInclude,
    });

    return updated;
};

export const deleteRider = async (id: string) => {
    const rider = await prisma.rider.findUnique({
        where: { id },
        include: { images: true },
    });
    if (!rider) throw { status: 404, message: "Rider not found" };

    // Hapus semua gambar dari Cloudinary terlebih dahulu
    for (const image of rider.images) {
        const publicId = image.url.split("/").slice(-3).join("/").split(".")[0];
        await cloudinary.uploader.destroy(publicId);
    }

    await prisma.rider.delete({ where: { id } });
    return { message: "Rider deleted successfully" };
};

export const uploadRiderImages = async (
    riderId: string,
    files: Express.Multer.File[]
) => {
    const rider = await prisma.rider.findUnique({ where: { id: riderId } });
    if (!rider) throw { status: 404, message: "Rider not found" };

    const nameSlug = slugify(rider.name, { lower: true, strict: true });
    const uploadedImages = [];

    const lastImage = await prisma.riderImage.findFirst({
        where: { riderId },
        orderBy: { order: "desc" },
    });
    const startOrder = lastImage ? lastImage.order + 1 : 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const result = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `surf-store/riders/${nameSlug}`,
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(file.buffer);
        });

        const image = await prisma.riderImage.create({
            data: {
                riderId,
                url: result.secure_url,
                order: startOrder + i,
            },
        });

        uploadedImages.push(image);
    }

    return uploadedImages;
};

export const uploadRiderVideo = async (
  id: string,
  file: Express.Multer.File
) => {
  const rider = await prisma.rider.findUnique({ where: { id } });
  if (!rider) throw { status: 404, message: "Rider not found" };

  // Hapus video lama dari Cloudinary kalau ada
  if (rider.videoUrl && rider.videoUrl.includes("cloudinary.com")) {
    try {
      const publicId = rider.videoUrl
        .split("/")
        .slice(-3)
        .join("/")
        .split(".")[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    } catch (err) {
      console.error("Failed to delete old rider video:", err);
    }
  }

  const nameSlug = slugify(rider.name, { lower: true, strict: true });

  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `surf-store/riders/${nameSlug}`,
        resource_type: "video",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(file.buffer);
  });

  const updated = await prisma.rider.update({
    where: { id },
    data: { videoUrl: result.secure_url },
    include: riderInclude,
  });

  return updated;
};

export const deleteRiderVideo = async (id: string) => {
  const rider = await prisma.rider.findUnique({ where: { id } });
  if (!rider) throw { status: 404, message: "Rider not found" };

  if (!rider.videoUrl) {
    throw { status: 400, message: "Rider has no video to delete" };
  }

  const publicId = rider.videoUrl
    .split("/")
    .slice(-3)
    .join("/")
    .split(".")[0];
  await cloudinary.uploader.destroy(publicId, { resource_type: "video" });

  const updated = await prisma.rider.update({
    where: { id },
    data: { videoUrl: null },
    include: riderInclude,
  });

  return updated;
};

export const deleteRiderImage = async (riderId: string, imageId: string) => {
    const image = await prisma.riderImage.findUnique({
        where: { id: imageId },
    });
    if (!image) throw { status: 404, message: "Image not found" };

    if (image.riderId !== riderId) {
        throw { status: 400, message: "Image does not belong to this rider" };
    }

    const publicId = image.url.split("/").slice(-3).join("/").split(".")[0];
    await cloudinary.uploader.destroy(publicId);

    await prisma.riderImage.delete({ where: { id: imageId } });
    return { message: "Image deleted successfully" };
};
