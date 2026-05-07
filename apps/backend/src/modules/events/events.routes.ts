import { Router } from "express";
import * as eventsController from "./events.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { optionalAuthMiddleware } from "../../middleware/optionalAuth.middleware";

const router = Router();
router.get("/me", authMiddleware, eventsController.getMyEvents);

router.get("/", eventsController.getEvents);
router.get("/nearby", eventsController.getNearbyEvents);

//  específicas
router.post("/:id/attend", authMiddleware, eventsController.attendEvent);
router.post("/:id/view", eventsController.trackView);

//  catch general
router.get("/:id", optionalAuthMiddleware, eventsController.getEventById);

router.post("/", authMiddleware, eventsController.createEvent);
router.delete("/:id", authMiddleware, eventsController.deleteEvent);
router.patch("/:id", authMiddleware, eventsController.updateEvent);

export default router;