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
const optImg = (url: string | null | undefined): string | null | undefined =>
    url ? optimizeCloudinaryUrl(url) : url;

/**
 * Generic transform for any record that has a top-level `url: string` field.
 * Used for: GalleryImage, ProductImage, RiderImage, NewReleaseImage.
 */
export const transformUrlItem = (item: any): any => ({
    ...item,
    url: optImg(item.url) ?? item.url,
});

/**
 * Testimonial: has `photoUrl` (image, nullable).
 */
export const transformTestimonial = (item: any): any => ({
    ...item,
    photoUrl: optImg(item.photoUrl),
});

/**
 * WallMagazine: has `imageUrl` (image, nullable).
 */
export const transformWallMagazine = (item: any): any => ({
    ...item,
    imageUrl: optImg(item.imageUrl),
});

/**
 * Product: has nested `images[].url`.
 * Does NOT touch `videoUrl` — product videos are YouTube embeds, not Cloudinary assets.
 */
export const transformProduct = (item: any): any => ({
    ...item,
    images: item.images?.map(transformUrlItem),
});

/**
 * Rider: has nested `images[].url`.
 * Does NOT touch `videoUrl` — Cloudinary video delivery uses different optimisation params.
 */
export const transformRider = (item: any): any => ({
    ...item,
    images: item.images?.map(transformUrlItem),
});

/**
 * NewRelease: has `logoUrl` (image), nested `images[].url`, and nested `product.images[].url`.
 * Does NOT touch `videoUrl` — Cloudinary video delivery uses different optimisation params.
 */
export const transformNewRelease = (item: any): any => ({
    ...item,
    logoUrl: optImg(item.logoUrl),
    images: item.images?.map(transformUrlItem),
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
