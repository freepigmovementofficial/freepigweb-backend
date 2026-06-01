import { Router } from "express";
import {
    index,
    show,
    store,
    update,
    destroy,
    uploadImages,
    destroyImage,
} from "./rider.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { upload, handleUploadError } from "../../middlewares/upload.middleware";
import {
    createRiderSchema,
    updateRiderSchema,
    riderQuerySchema,
} from "./rider.validation";

const router = Router();

// Public
router.get("/", validate(riderQuerySchema), index);
router.get("/:id", show);

// Admin only
router.post("/", authenticate, requireAdmin, validate(createRiderSchema), store);
router.put("/:id", authenticate, requireAdmin, validate(updateRiderSchema), update);
router.delete("/:id", authenticate, requireAdmin, destroy);
router.post("/:id/images", authenticate, requireAdmin, upload.array("images", 10), handleUploadError, uploadImages);
router.delete("/:id/images/:imageId", authenticate, requireAdmin, destroyImage);

export default router;
