import crypto from "crypto";
import sharp from "sharp";

/**
 * Media helper — now backed by Bunny.net Storage + CDN (previously Cloudinary).
 *
 * The file name and the exported function names are intentionally unchanged so
 * every module that imports uploadImage / uploadVideo / destroyAsset keeps working.
 * The returned object still has a `secure_url` field for the same reason.
 *
 * Required environment variables (set them in Railway):
 *   BUNNY_STORAGE_ZONE  - name of the Bunny Storage Zone
 *   BUNNY_STORAGE_KEY   - the Storage Zone password (FTP & API Access)
 *   BUNNY_CDN_URL       - public Pull Zone URL, e.g. https://namamu.b-cdn.net
 *   BUNNY_STORAGE_HOST  - optional, storage host of your region.
 *                         Default: storage.bunnycdn.com (Falkenstein).
 *                         Singapore: sg.storage.bunnycdn.com
 */

const getConfig = () => {
    const zone = process.env.BUNNY_STORAGE_ZONE;
    const key = process.env.BUNNY_STORAGE_KEY;
    const cdn = process.env.BUNNY_CDN_URL;
    const host = process.env.BUNNY_STORAGE_HOST || "storage.bunnycdn.com";

    if (!zone || !key || !cdn) {
        throw new Error(
            "Bunny is not configured. Set BUNNY_STORAGE_ZONE, BUNNY_STORAGE_KEY and BUNNY_CDN_URL."
        );
    }

    return { zone, key, cdn: cdn.replace(/\/+$/, ""), host };
};

const cleanFolder = (folder: string): string => folder.replace(/^\/+|\/+$/g, "");

const randomName = (ext: string): string =>
    `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;

/** PUTs a buffer to Bunny Storage and returns the public CDN URL. */
const putToBunny = async (
    buffer: Buffer,
    folder: string,
    fileName: string,
    contentType: string
): Promise<string> => {
    const { zone, key, cdn, host } = getConfig();
    const path = `${cleanFolder(folder)}/${fileName}`;

    const res = await fetch(`https://${host}/${zone}/${path}`, {
        method: "PUT",
        headers: {
            AccessKey: key,
            "Content-Type": contentType,
        },
        body: buffer as any,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Bunny upload failed (${res.status}): ${text}`);
    }

    return `${cdn}/${path}`;
};

/**
 * Uploads an image. The image is auto-rotated, downscaled to max 1920px wide
 * (never upscaled) and converted to WebP, which keeps files small and keeps
 * transparency for PNG logos.
 */
export const uploadImage = async (
    buffer: Buffer,
    folder: string,
    _options: Record<string, any> = {}
): Promise<any> => {
    const optimized = await sharp(buffer)
        .rotate()
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

    const url = await putToBunny(optimized, folder, randomName("webp"), "image/webp");
    return { secure_url: url, url };
};

/**
 * Uploads a video as-is (no re-encoding). Tip: export videos as MP4 (H.264)
 * and compress them before uploading, because Bunny does not transcode here.
 */
export const uploadVideo = async (
    buffer: Buffer,
    folder: string,
    _options: Record<string, any> = {}
): Promise<any> => {
    // WebM files start with the EBML header 1A 45 DF A3; everything else is treated as MP4/MOV.
    const isWebm =
        buffer.length > 4 &&
        buffer[0] === 0x1a &&
        buffer[1] === 0x45 &&
        buffer[2] === 0xdf &&
        buffer[3] === 0xa3;

    const ext = isWebm ? "webm" : "mp4";
    const url = await putToBunny(buffer, folder, randomName(ext), isWebm ? "video/webm" : "video/mp4");
    return { secure_url: url, url };
};

/**
 * Deletes a file from Bunny by its public URL. Old Cloudinary URLs and any
 * other external URLs are ignored. Errors are logged, never thrown, so they
 * never interrupt the main operation.
 */
export const destroyAsset = async (
    url: string | null | undefined,
    _resourceType: "image" | "video" = "image"
): Promise<void> => {
    if (!url) return;

    try {
        const { zone, key, cdn, host } = getConfig();
        if (!url.startsWith(`${cdn}/`)) return;

        const path = url.slice(cdn.length + 1).split("?")[0];
        const res = await fetch(`https://${host}/${zone}/${path}`, {
            method: "DELETE",
            headers: { AccessKey: key },
        });

        if (!res.ok && res.status !== 404) {
            console.error(`Failed to delete Bunny asset (${res.status}): ${path}`);
        }
    } catch (err) {
        console.error("Failed to delete Bunny asset:", err);
    }
};
