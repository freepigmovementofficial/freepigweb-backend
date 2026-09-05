import cloudinary from "../config/cloudinary";

/**
 * Extracts the Cloudinary publicId from a URL robustly, handling any folder depth.
 *
 * Example:
 *   Input:  "https://res.cloudinary.com/demo/image/upload/v123/surf-store/products/my-slug/abc.jpg"
 *   Output: "surf-store/products/my-slug/abc"
 *
 * The old pattern `url.split("/").slice(-3).join("/")` only works for 2-level-deep
 * folders (surf-store/folder/file). For 3-level folders (surf-store/products/slug/file)
 * it silently drops the "surf-store/" prefix, making destroy() a no-op.
 */
export const extractPublicId = (url: string): string => {
    const marker = "/upload/";
    const idx = url.indexOf(marker);
    if (idx === -1) throw new Error(`Not a valid Cloudinary upload URL: ${url}`);

    const afterUpload = url.slice(idx + marker.length);

    // Cloudinary URLs may have transformation params injected before the version segment
    // (e.g. "f_auto,q_auto/v1780545746/surf-store/..."). We use the version number as a
    // reliable anchor to skip any transformation segments safely, regardless of how many
    // params were added. If no version is present (rare), fall back to the raw path.
    const vIdx = afterUpload.search(/(?:^|\/)v\d+\//);
    const withVersion = vIdx >= 0
        ? afterUpload.slice(vIdx).replace(/^\//, "") // strip leading slash if anchor was mid-string
        : afterUpload;                                // fallback: no version segment in URL

    return withVersion
        .replace(/^v\d+\//, "")      // strip version segment (v1234567890/)
        .replace(/\.[^/.]+$/, "");   // strip file extension (.jpg, .mp4, etc.)
};

/**
 * Uploads an image buffer to Cloudinary with automatic quality compression and
 * dimension capping. Images larger than 1920px wide are resized; quality is
 * reduced automatically to minimise file size while preserving visual quality.
 */
export const uploadImage = (
    buffer: Buffer,
    folder: string,
    options: Record<string, any> = {}
): Promise<any> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder,
                    resource_type: "image",
                    // Incoming transformation: stored file is the compressed version
                    transformation: [
                        {
                            quality: "auto:good", // auto quality — typically 40-70% smaller
                            width: 1920,
                            crop: "limit",         // never upscale, only downscale
                        },
                    ],
                    ...options,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            )
            .end(buffer);
    });
};

/**
 * Uploads a video buffer to Cloudinary with automatic quality compression and
 * MP4 format normalisation. This significantly reduces video file size compared
 * to storing the raw upload.
 */
export const uploadVideo = (
    buffer: Buffer,
    folder: string,
    options: Record<string, any> = {}
): Promise<any> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder,
                    resource_type: "video",
                    quality: "auto",    // auto quality — typically 40-80% smaller
                    format: "mp4",      // normalise to mp4 for best browser compatibility
                    video_codec: "auto",
                    ...options,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            )
            .end(buffer);
    });
};

/**
 * Destroys a Cloudinary asset by its URL. Uses robust publicId extraction so it
 * works correctly regardless of how many folder levels deep the asset is stored.
 * Errors are caught and logged so they never interrupt the main operation.
 */
export const destroyAsset = async (
    url: string | null | undefined,
    resourceType: "image" | "video" = "image"
): Promise<void> => {
    if (!url || !url.includes("cloudinary.com")) return;

    try {
        const publicId = extractPublicId(url);
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
        console.error("Failed to delete Cloudinary asset:", err);
    }
};
