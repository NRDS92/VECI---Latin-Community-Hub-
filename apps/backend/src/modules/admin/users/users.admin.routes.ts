import { Router } from "express";

import * as controller from "./users.admin.controller";

const router = Router();

router.get(
    "/",
    controller.getUsers
);

router.get(
    "/:id",
    controller.getUserById
);

router.patch(
    "/:id/role",
    controller.changeUserRole
);

router.delete(
    "/:id",
    controller.deleteUser
);

export default router;