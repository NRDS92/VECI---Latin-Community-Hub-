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

        // TODO: Replace with authenticated admin user
        const adminId = "6a5473977311303a364400c1";

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

export const rejectEvent = catchAsync(
    async (
        req: Request<{ id: string }>,
        res: Response
    ) => {

        const adminId =
            "6a5473977311303a364400c1";

        const event =
            await adminService.rejectEvent(
                req.params.id,
                adminId,
                req.body.reason,
                req.body.comment
            );

        res.json({
            success: true,
            message:
                "Event rejected successfully.",
            data: event,
        });
    }
);