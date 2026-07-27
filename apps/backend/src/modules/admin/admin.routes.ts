import { Router } from "express";
import * as adminController from "./admin.controller";

const router = Router();

router.get(
    "/events/pending",
    adminController.getPendingEvents
);

export default router;