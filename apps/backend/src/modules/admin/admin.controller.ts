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