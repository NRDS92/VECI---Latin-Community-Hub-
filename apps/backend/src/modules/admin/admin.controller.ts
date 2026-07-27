import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import * as adminService from "./admin.service";

export const getPendingEvents = catchAsync(
    async (_req: Request, res: Response) => {
        const events = await adminService.getPendingEvents();

        res.json({
            success: true,
            data: events,
        });
    }
);

export const approveEvent = catchAsync(
    async (
        req: Request<{ id: string }>,
        res: Response
    ) => {

        // TODO:
        // Replace this with authenticated admin user once
        // the authentication and roles system is implemented.
        const adminId = "TU_OBJECT_ID";

        const event = await adminService.approveEvent(
            req.params.id,
            adminId
        );

        res.json({
            success: true,
            message: "Event approved successfully.",
            data: event,
        });
    }
);