import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/products/product.routes";
import reviewRoutes from "./modules/reviews/review.routes";
import wishlistRoutes from "./modules/wishlist/wishlist.routes";
import riderRoutes from "./modules/riders/rider.routes";
import customOrderRoutes from "./modules/custom-orders/custom-order.routes";
import adminRoutes from "./modules/admin/admin.routes";
import newReleaseRoutes from "./modules/new-releases/new-release.routes";
import featuredRoutes from "./modules/featured/featured.routes";
import storeReviewRoutes from "./modules/store-reviews/store-review.routes";
// import orderRoutes from "./modules/orders/order.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/", reviewRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/riders", riderRoutes);
router.use("/custom-orders", customOrderRoutes);
router.use("/admin", adminRoutes);
router.use("/new-releases", newReleaseRoutes);
router.use("/featured", featuredRoutes);
router.use("/store-reviews", storeReviewRoutes);
// router.use("/orders", orderRoutes);

export default router;