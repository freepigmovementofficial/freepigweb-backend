import optimizeCloudinaryUrl from "./helper";

/**
 * Applies f_auto + q_auto delivery params to a Cloudinary image URL.
 * Returns null/undefined as-is so callers don't need to null-check.
 *
 * f_auto → serve WebP/AVIF to modern browsers (25–35% smaller than JPEG)
 * q_auto → adaptive quality compression per-image (30–60% size reduction)
 *
 * For files already compressed at upload time (quality: "auto:good"), f_auto
 * still reduces delivery size further by converting the format at the CDN edge.
 */
const optImg = (url: string | null | undefined, width?: number): string | null | undefined =>
    url ? optimizeCloudinaryUrl(url, width) : url;

/**
 * Generic transform for any record that has a top-level `url: string` field.
 * Used for admin upload responses where the original resolution is preferred.
 */
export const transformUrlItem = (item: any): any => ({
    ...item,
    url: optImg(item.url) ?? item.url,
});

/**
 * Gallery image for public display — capped at 1200px.
 * Wider than product cards since gallery images are often shown full-width.
 */
export const transformGalleryItem = (item: any): any => ({
    ...item,
    url: optImg(item.url, 1200) ?? item.url,
});

/**
 * Testimonial: has `photoUrl` (image, nullable).
 * Avatar-sized display — 200px is sufficient.
 */
export const transformTestimonial = (item: any): any => ({
    ...item,
    photoUrl: optImg(item.photoUrl, 200),
});

/**
 * WallMagazine: has `imageUrl` (image, nullable).
 * Editorial content — 1200px cap for large display.
 */
export const transformWallMagazine = (item: any): any => ({
    ...item,
    imageUrl: optImg(item.imageUrl, 1200),
});

/**
 * Product: has nested `images[].url`.
 * 800px covers both listing card and detail view without over-fetching.
 * Does NOT touch `videoUrl` — product videos are YouTube embeds, not Cloudinary assets.
 */
export const transformProduct = (item: any): any => ({
    ...item,
    images: item.images?.map((img: any) => ({ ...img, url: optImg(img.url, 800) ?? img.url })),
});

/**
 * Rider: has nested `images[].url`.
 * 800px — same reasoning as product images.
 * Does NOT touch `videoUrl` — Cloudinary video delivery uses different optimisation params.
 */
export const transformRider = (item: any): any => ({
    ...item,
    images: item.images?.map((img: any) => ({ ...img, url: optImg(img.url, 800) ?? img.url })),
});

/**
 * NewRelease: has `logoUrl` (image), nested `images[].url`, and nested `product.images[].url`.
 * Logo is displayed smaller (400px); gallery-style images use 800px.
 * Does NOT touch `videoUrl` — Cloudinary video delivery uses different optimisation params.
 */
export const transformNewRelease = (item: any): any => ({
    ...item,
    logoUrl: optImg(item.logoUrl, 400),
    images: item.images?.map((img: any) => ({ ...img, url: optImg(img.url, 800) ?? img.url })),
    product: item.product ? transformProduct(item.product) : item.product,
});

/**
 * FeaturedSection: deep-nested → section → products[].product.images[].url
 */
export const transformFeaturedSection = (item: any): any => ({
    ...item,
    products: item.products?.map((fp: any) => ({
        ...fp,
        product: fp.product ? transformProduct(fp.product) : fp.product,
    })),
});

/**
 * WishlistItem: has nested product → images[].url
 */
export const transformWishlistItem = (item: any): any => ({
    ...item,
    product: item.product ? transformProduct(item.product) : item.product,
});
