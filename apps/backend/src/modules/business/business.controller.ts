import { Request, Response, NextFunction } from "express";
import * as service from "./business.service";
import { CreateBusinessInput } from "./business.validation";
import { Business } from "./business.model";


type Params = {
    id: string;
};

export const createBusiness = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const ownerId = (req as any).user.id;

        const business = await service.createBusiness(
            req.body,
            ownerId
        );

        res.status(201).json({
            success: true,
            data: business,
        });
    } catch (err) {
        next(err);
    }
};

export const getMyBusinesses = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const ownerId = (req as any).user.id;

        const businesses = await service.getMyBusinesses(ownerId);

        res.json({
            success: true,
            data: businesses,
        });
    } catch (err) {
        next(err);
    }
};

export const getBusinessById = async (
    req: Request<Params>,
    res: Response,
    next: NextFunction
) => {
    try {
        const business = await service.getBusinessById(req.params.id);

        res.json({
            success: true,
            data: business,
        });
    } catch (err) {
        next(err);
    }
};

export const updateBusiness = async (
    req: Request<Params>,
    res: Response,
    next: NextFunction
) => {
    try {
        const ownerId = (req as any).user.id;

        const business = await service.updateBusiness(
            req.params.id,
            ownerId,
            req.body
        );

        res.json({
            success: true,
            data: business,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteBusiness = async (
    req: Request<Params>,
    res: Response,
    next: NextFunction
) => {
    try {
        const ownerId = (req as any).user.id;

        await service.deleteBusiness(req.params.id, ownerId);

        res.json({
            success: true,
        });
    } catch (err) {
        next(err);
    }
};