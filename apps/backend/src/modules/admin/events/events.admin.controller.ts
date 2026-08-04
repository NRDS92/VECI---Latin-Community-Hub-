import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import * as eventsAdminService from "../events/events.admin.service";

export const getEvents = catchAsync(
    async (req: Request, res: Response) => {

        const status =
            req.query.status as string | undefined;

        const events =
            await eventsAdminService.getAdminEvents(status);

        res.json({
            success: true,
            data: events,
        });
    }
);

export const getPendingEvents = catchAsync(
    async (_req: Request, res: Response) => {
        const events = await eventsAdminService.getPendingAdminEvents();

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

        const event = await eventsAdminService.approveEvent(
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
            await eventsAdminService.rejectEvent(
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