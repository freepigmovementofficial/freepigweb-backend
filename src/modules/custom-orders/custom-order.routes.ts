import { Router } from "express";
import { store, me, show } from "./custom-order.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
    createCustomOrderSchema,
    customOrderQuerySchema,
} from "./custom-order.validation";

const router = Router();

router.post("/", authenticate, validate(createCustomOrderSchema), store);
router.get("/me", authenticate, validate(customOrderQuerySchema), me);
router.get("/:id", authenticate, show);

export default router;
