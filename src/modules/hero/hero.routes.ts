import { Router } from "express";
import {
    getActive,
    index,
    store,
    update,
    destroy,
    uploadVideo,
    toggle,
} from "./hero.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { uploadVideo as uploadVideoMiddleware, handleUploadError } from "../../middlewares/upload.middleware";
import { createHeroSchema, updateHeroSchema } from "./hero.validation";

const router = Router();

// Public
router.get("/active", getActive);

// Admin only
router.get("/", authenticate, requireAdmin, index);
router.post("/", authenticate, requireAdmin, validate(createHeroSchema), store);
router.put("/:id", authenticate, requireAdmin, validate(updateHeroSchema), update);
router.delete("/:id", authenticate, requireAdmin, destroy);
router.post("/:id/video", authenticate, requireAdmin, uploadVideoMiddleware.single("video"), handleUploadError, uploadVideo);
router.patch("/:id/toggle", authenticate, requireAdmin, toggle);

export default router;
