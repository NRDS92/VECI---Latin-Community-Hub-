import { Request, Response, NextFunction } from "express";

import * as service from "./business.admin.service";

type Params = {
    id: string;
};

export const getBusinesses = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const status = req.query.status as string | undefined;

        const businesses = await service.getBusinesses(status);

        res.json({
            success: true,
            data: businesses,
        });
    } catch (error) {
        next(error);
    }
};

export const getPendingBusinesses = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const businesses =
            await service.getPendingBusinesses();

        res.json({
            success: true,
            data: businesses,
        });
    } catch (error) {
        next(error);
    }
};

export const approveBusiness = async (
    req: Request<Params>,
    res: Response,
    next: NextFunction
) => {
    try {
        const adminId = (req as any).user.id;

        const business =
            await service.approveBusiness(
                req.params.id,
                adminId
            );

        res.json({
            success: true,
            data: business,
        });
    } catch (error) {
        next(error);
    }
};

export const rejectBusiness = async (
    req: Request<Params>,
    res: Response,
    next: NextFunction
) => {
    try {
        const adminId = (req as any).user.id;

        const {
            reason,
            comment,
        } = req.body;

        const business =
            await service.rejectBusiness(
                req.params.id,
                adminId,
                reason,
                comment
            );

        res.json({
            success: true,
            data: business,
        });
    } catch (error) {
        next(error);
    }
};