import { Router } from "express";
import {
    getDashboard,
    getUsers,
    destroyUser,
    getCustomOrders,
    updateOrderStatus,
    getReviews,
    destroyReview,
} from "./admin.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
    adminUserQuerySchema,
    adminCustomOrderQuerySchema,
    updateCustomOrderStatusSchema,
    adminReviewQuerySchema,
} from "./admin.validation";

const router = Router();

// Apply authenticate and requireAdmin to all admin routes
router.use(authenticate, requireAdmin);

router.get("/dashboard", getDashboard);

router.get("/users", validate(adminUserQuerySchema), getUsers);
router.delete("/users/:id", destroyUser);

router.get("/custom-orders", validate(adminCustomOrderQuerySchema), getCustomOrders);
router.patch("/custom-orders/:id/status", validate(updateCustomOrderStatusSchema), updateOrderStatus);

router.get("/reviews", validate(adminReviewQuerySchema), getReviews);
router.delete("/reviews/:id", destroyReview);

export default router;
