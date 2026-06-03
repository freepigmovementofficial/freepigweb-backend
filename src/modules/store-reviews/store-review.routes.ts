import { Router } from "express";
import { index, store, update, destroy } from "./store-review.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
    createStoreReviewSchema,
    updateStoreReviewSchema,
    storeReviewQuerySchema,
} from "./store-review.validation";

const router = Router();

router.get("/", validate(storeReviewQuerySchema), index);
router.post("/", authenticate, validate(createStoreReviewSchema), store);
router.put("/:id", authenticate, validate(updateStoreReviewSchema), update);
router.delete("/:id", authenticate, destroy);

export default router;
