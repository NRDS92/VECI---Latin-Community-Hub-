import {
    Request,
    Response,
    NextFunction,
} from "express";

import * as service from "./business.service";
import { toOwnerBusiness } from "./business.mapper";
import {
    BusinessFollowStatusResponseSchema,
    OwnerBusinessStatsResponseSchema,
    TrackBusinessBehaviorRequestSchema,
} from "@ndrs92/contracts";
import {
    getBusinessFollowStatus,
    getFollowedBusinesses,
    getOwnerBusinessStats,
    setBusinessFollow,
    trackBusinessBehavior,
} from "./business-engagement.service";
import { toPublicBusiness } from "../../shared/public-content/mappers/business.mapper";
import { AppError } from "../../shared/errors/AppError";


type Params = {
    id: string;
};


// ======================================================
// CREATE BUSINESS
// ======================================================

export const createBusiness = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const ownerId = (req as any).user.id;


        const business =
            await service.createBusiness(
                req.body,
                ownerId
            );


        res.status(201).json({
            success: true,
            data: toOwnerBusiness(business),
        });

    } catch (err) {

        next(err);
    }
};


// ======================================================
// GET MY BUSINESSES
// ======================================================

export const getMyBusinesses = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const ownerId = (req as any).user.id;


        const businesses =
            await service.getMyBusinesses(
                ownerId
            );


        res.json({
            success: true,
            data: businesses.map(toOwnerBusiness),
        });

    } catch (err) {

        next(err);
    }
};


// ======================================================
// GET BUSINESS BY ID
// ======================================================

export const getBusinessById = async (
    req: Request<Params>,
    res: Response,
    next: NextFunction
) => {

    try {

        const business =
            await service.getBusinessById(
                req.params.id
            );

        if (String(business.owner) !== String((req as any).user.id)) {
            throw new AppError("Unauthorized", 403, "FORBIDDEN");
        }


        res.json({
            success: true,
            data: toOwnerBusiness(business),
        });

    } catch (err) {

        next(err);
    }
};


// ======================================================
// UPDATE BUSINESS
// ======================================================

export const updateBusiness = async (
    req: Request<Params>,
    res: Response,
    next: NextFunction
) => {

    try {

        const ownerId =
            (req as any).user.id;


        const business =
            await service.updateBusiness(
                req.params.id,
                ownerId,
                req.body
            );


        res.json({
            success: true,
            data: toOwnerBusiness(business),
        });

    } catch (err) {

        next(err);
    }
};


// ======================================================
// DELETE BUSINESS
// ======================================================

export const deleteBusiness = async (
    req: Request<Params>,
    res: Response,
    next: NextFunction
) => {

    try {

        const ownerId =
            (req as any).user.id;


        await service.deleteBusiness(
            req.params.id,
            ownerId
        );


        res.json({
            success: true,
        });

    } catch (err) {

        next(err);
    }
};

export const followBusiness = async (req: Request<Params>, res: Response, next: NextFunction) => {
    try {
        const data = await setBusinessFollow(req.params.id, (req as any).user.id, true);
        res.json(BusinessFollowStatusResponseSchema.parse({ success: true, data }));
    } catch (err) { next(err); }
};

export const unfollowBusiness = async (req: Request<Params>, res: Response, next: NextFunction) => {
    try {
        const data = await setBusinessFollow(req.params.id, (req as any).user.id, false);
        res.json(BusinessFollowStatusResponseSchema.parse({ success: true, data }));
    } catch (err) { next(err); }
};

export const getFollowStatus = async (req: Request<Params>, res: Response, next: NextFunction) => {
    try {
        const data = await getBusinessFollowStatus(req.params.id, (req as any).user.id);
        res.json(BusinessFollowStatusResponseSchema.parse({ success: true, data }));
    } catch (err) { next(err); }
};

export const listFollowedBusinesses = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const rows = await getFollowedBusinesses((_req as any).user.id);
        res.json({ success: true, data: rows.map(({ business, slug }) => toPublicBusiness(business, slug)) });
    } catch (err) { next(err); }
};

export const recordBehavior = async (req: Request<Params>, res: Response, next: NextFunction) => {
    try {
        const input = TrackBusinessBehaviorRequestSchema.parse(req.body);
        const data = await trackBusinessBehavior(req.params.id, {
            userId: (req as any).user?.id,
            ip: req.ip ?? req.socket.remoteAddress ?? "unknown",
            userAgent: req.get("user-agent") ?? "",
        }, input);
        res.status(202).json({ success: true, data });
    } catch (err) { next(err); }
};

export const validateBehaviorPayload = (req: Request, _res: Response, next: NextFunction) => {
    try {
        req.body = TrackBusinessBehaviorRequestSchema.parse(req.body);
        next();
    } catch (err) { next(err); }
};

export const getBusinessStats = async (req: Request<Params>, res: Response, next: NextFunction) => {
    try {
        const data = await getOwnerBusinessStats(req.params.id, (req as any).user.id);
        res.json(OwnerBusinessStatsResponseSchema.parse({ success: true, data }));
    } catch (err) { next(err); }
};
