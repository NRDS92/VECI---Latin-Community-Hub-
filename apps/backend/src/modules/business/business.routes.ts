import { Router } from "express";
import * as controller from "./business.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { optionalAuthMiddleware } from "../../middleware/auth.middleware";
import { businessBehaviorRateLimit } from "../../middleware/business-behavior-rate-limit.middleware";

const router = Router();

// Static path before /:id to avoid treating "followed" as an ID.
router.get("/followed", authMiddleware, controller.listFollowedBusinesses);
router.post("/:id/follow", authMiddleware, controller.followBusiness);
router.delete("/:id/follow", authMiddleware, controller.unfollowBusiness);
router.get("/:id/follow-status", authMiddleware, controller.getFollowStatus);
router.post("/:id/behavior", optionalAuthMiddleware, controller.validateBehaviorPayload, businessBehaviorRateLimit, controller.recordBehavior);
router.get("/:id/stats", authMiddleware, controller.getBusinessStats);
router.get("/me", authMiddleware, controller.getMyBusinesses);
router.get("/:id", authMiddleware, controller.getBusinessById);

router.post("/", authMiddleware, controller.createBusiness);
router.put("/:id", authMiddleware, controller.updateBusiness);
router.delete("/:id", authMiddleware, controller.deleteBusiness);

export default router;
