import { Router } from "express";
import {
    getActive,
    index,
    store,
    update,
    destroy,
    setProducts,
    removeProduct,
    toggle,
} from "./featured.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
    createFeaturedSectionSchema,
    updateFeaturedSectionSchema,
    setFeaturedProductsSchema,
} from "./featured.validation";

const router = Router();

// Public
router.get("/active", getActive);

// Admin only
router.get("/", authenticate, requireAdmin, index);
router.post("/", authenticate, requireAdmin, validate(createFeaturedSectionSchema), store);
router.put("/:id", authenticate, requireAdmin, validate(updateFeaturedSectionSchema), update);
router.delete("/:id", authenticate, requireAdmin, destroy);
router.post("/:id/products", authenticate, requireAdmin, validate(setFeaturedProductsSchema), setProducts);
router.delete("/:id/products/:productId", authenticate, requireAdmin, removeProduct);
router.patch("/:id/toggle", authenticate, requireAdmin, toggle);

export default router;
