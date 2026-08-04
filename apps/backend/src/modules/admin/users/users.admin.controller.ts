import { Request, Response, NextFunction } from "express";

import * as service from "./users.admin.service";

type Params = {
    id: string;
};

export const getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const users =
            await service.getUsers();

        res.json({
            success: true,
            data: users,
        });

    } catch (error) {

        next(error);

    }

};

export const getUserById = async (
    req: Request<Params>,
    res: Response,
    next: NextFunction
) => {

    try {

        const user =
            await service.getUserById(
                req.params.id
            );

        res.json({
            success: true,
            data: user,
        });

    } catch (error) {

        next(error);

    }

};

export const changeUserRole = async (
    req: Request<Params>,
    res: Response,
    next: NextFunction
) => {

    try {

        const user =
            await service.changeUserRole(
                req.params.id,
                req.body.role
            );

        res.json({
            success: true,
            data: user,
        });

    } catch (error) {

        next(error);

    }

};

export const deleteUser = async (
    req: Request<Params>,
    res: Response,
    next: NextFunction
) => {

    try {

        await service.deleteUser(
            req.params.id
        );

        res.json({
            success: true,
        });

    } catch (error) {

        next(error);

    }

};