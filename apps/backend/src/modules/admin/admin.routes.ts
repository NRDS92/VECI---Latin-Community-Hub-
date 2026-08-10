import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { requireAdmin } from "../../middleware/require-admin.middleware";

import dashboardRoutes from "./dashboard/dashboard.routes";
import eventsRoutes from "./events/events.admin.routes";
import businessRoutes from "./business/business.admin.routes";
import usersRoutes from "./users/users.admin.routes";

const router = Router();

// Authentication
router.use(authMiddleware);

// Authorization
router.use(requireAdmin);

// Modules
router.use("/dashboard", dashboardRoutes);
router.use("/", eventsRoutes);
router.use("/", businessRoutes);
router.use("/", usersRoutes);

export default router;