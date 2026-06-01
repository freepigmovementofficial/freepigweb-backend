import { Router } from "express";
import { toggle, index, check } from "./wishlist.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, index);
router.post("/:productId", authenticate, toggle);
router.get("/:productId/check", authenticate, check);

export default router;
