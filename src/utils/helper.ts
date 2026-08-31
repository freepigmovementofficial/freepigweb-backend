/**
 * Appends Cloudinary delivery transformation params to an existing URL so that
 * the CDN serves the image in the most efficient format (WebP/AVIF) and quality
 * for the requesting browser.
 *
 * This is useful for images that were uploaded before quality compression was
 * applied at upload time — the transformation is generated and cached by
 * Cloudinary on first request, reducing all subsequent delivery sizes by 30-60%.
 */
const optimizeCloudinaryUrl = (url: string): string => {
    if (!url || !url.includes("/upload/")) return url;

    // Already has delivery optimisation params — skip
    if (url.includes("/f_auto") || url.includes("/q_auto")) return url;

    return url.replace("/upload/", "/upload/f_auto,q_auto/");
};

export default optimizeCloudinaryUrl;
