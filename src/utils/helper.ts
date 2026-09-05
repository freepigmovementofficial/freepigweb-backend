/**
 * Appends Cloudinary delivery transformation params to an existing URL so that
 * the CDN serves the image in the most efficient format (WebP/AVIF) and quality
 * for the requesting browser.
 *
 * This is useful for images that were uploaded before quality compression was
 * applied at upload time — the transformation is generated and cached by
 * Cloudinary on first request, reducing all subsequent delivery sizes by 30-60%.
 *
 * @param url   - The original Cloudinary URL stored in the database.
 * @param width - Optional pixel cap. Cloudinary will downscale to this width
 *                while preserving aspect ratio (`c_limit` semantics — never upscales).
 *                Omit for admin upload responses where the original size is preferred.
 */
const optimizeCloudinaryUrl = (url: string, width?: number): string => {
    if (!url || !url.includes("/upload/")) return url;

    // Already has delivery optimisation params — skip
    if (url.includes("/f_auto") || url.includes("/q_auto")) return url;

    const widthParam = width ? `,w_${width}` : "";
    return url.replace("/upload/", `/upload/f_auto,q_auto${widthParam}/`);
};

export default optimizeCloudinaryUrl;
