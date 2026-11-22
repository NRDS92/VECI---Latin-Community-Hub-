import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import * as controller from "./community.controller";

const router = Router();

// Static paths are registered before parameter routes to avoid shadowing.
router.get("/discover", controller.discover);
router.get("/slug/:slug", controller.publicBySlug);

router.use(authMiddleware, (_req, res, next) => {
  res.setHeader("Cache-Control", "private, no-store");
  next();
});

router.get("/me", controller.mine);
router.get("/notifications", controller.listNotifications);
router.patch("/notifications/:notificationId/read", controller.markNotificationRead);
router.post("/", controller.create);
router.get("/:communityId/owner", controller.owner);
router.patch("/:communityId", controller.update);
router.get("/:communityId/membership", controller.membershipStatus);
router.post("/:communityId/membership", controller.join);
router.delete("/:communityId/membership/request", controller.cancelRequest);
router.delete("/:communityId/membership", controller.leave);
router.get("/:communityId/membership/requests", controller.pendingMemberships);
router.get("/:communityId/members", controller.managedMembers);
router.patch("/:communityId/membership/:userId", controller.membershipAction);

router.get("/:communityId/posts", controller.listPosts);
router.post("/:communityId/posts", controller.createPost);
router.patch("/:communityId/posts/:postId", controller.updatePost);
router.delete("/:communityId/posts/:postId", controller.deletePost);
router.get("/:communityId/posts/:postId/comments", controller.listComments);
router.post("/:communityId/posts/:postId/comments", controller.createComment);
router.post("/:communityId/reports", controller.reportContent);
router.get("/:communityId/reports", controller.listCommunityReports);
router.patch("/:communityId/reports/:reportId", controller.resolveCommunityReport);
router.post("/:communityId/moderate-content", controller.moderateCommunityContent);

export default router;
