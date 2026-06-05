import { Router } from "express";
import {
    index,
    getAll,
    store,
    update,
    destroy,
    uploadPhoto,
    toggleActive,
} from "./testimonial.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { upload, handleUploadError } from "../../middlewares/upload.middleware";
import {
    createTestimonialSchema,
    updateTestimonialSchema,
    testimonialQuerySchema,
} from "./testimonial.validation";

const router = Router();

// Public route
router.get("/", validate(testimonialQuerySchema), index);

// Admin routes (GET /all is registered before other routes using parameters to avoid router conflict)
router.get("/all", authenticate, requireAdmin, validate(testimonialQuerySchema), getAll);
router.post("/", authenticate, requireAdmin, validate(createTestimonialSchema), store);
router.put("/:id", authenticate, requireAdmin, validate(updateTestimonialSchema), update);
router.delete("/:id", authenticate, requireAdmin, destroy);
router.post("/:id/photo", authenticate, requireAdmin, upload.single("photo"), handleUploadError, uploadPhoto);
router.patch("/:id/toggle", authenticate, requireAdmin, toggleActive);

export default router;
