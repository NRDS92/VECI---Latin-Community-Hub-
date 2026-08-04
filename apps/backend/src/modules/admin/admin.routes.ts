import { Router } from "express";

import eventsRoutes from "./events/events.admin.routes";
import businessRoutes from "./business/business.admin.routes";
import usersRoutes from "./users/users.admin.routes";
import dashboardRoutes from "./dashboard/dashboard.routes";

const router = Router();

router.use("/events", eventsRoutes);

router.use("/businesses", businessRoutes);

router.use("/users", usersRoutes);

router.use("/dashboard", dashboardRoutes);

export default router;