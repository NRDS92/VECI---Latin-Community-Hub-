import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { AppError } from "../../../shared/errors/AppError";
import * as eventsAdminService from "../events/events.admin.service";

const adminId = (req: Request) => {
    const id = (req as Request & { user?: { id?: string } }).user?.id;
    if (!id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    return id;
};

export const getEvents = catchAsync(async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    const events =
        await eventsAdminService.getAdminEvents(status);
    res.json({
        success: true,
        data: events,
    });

});

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
        const result =
            await eventsAdminService.approveEvent(
                req.params.id,
                adminId(req)
            );
        res.json({
            success: true,
            message: "Event approved and published successfully.",
            data: result,
        });
    }
);

export const rejectEvent = catchAsync(
    async (
        req: Request<{ id: string }>,
        res: Response
    ) => {
        const event =
            await eventsAdminService.rejectEvent(
                req.params.id,
                adminId(req),
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
