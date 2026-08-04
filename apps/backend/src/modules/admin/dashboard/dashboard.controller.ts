import { Request, Response, NextFunction } from "express";

import * as dashboardService from "./dashboard.service";

export const getDashboard = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const dashboard =
            await dashboardService.getDashboard();

        res.json({
            success: true,
            data: dashboard,
        });

    } catch (error) {

        next(error);

    }

};