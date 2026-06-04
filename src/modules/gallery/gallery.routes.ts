import { Router } from "express";
import { index, store, update, destroy } from "./gallery.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { upload, handleUploadError } from "../../middlewares/upload.middleware";
import { galleryQuerySchema, updateGallerySchema } from "./gallery.validation";

const router = Router();

// Public
router.get("/", validate(galleryQuerySchema), index);

// Admin only
router.post("/", authenticate, requireAdmin, upload.array("images", 20), handleUploadError, store);
router.patch("/:id", authenticate, requireAdmin, validate(updateGallerySchema), update);
router.delete("/:id", authenticate, requireAdmin, destroy);

export default router;
