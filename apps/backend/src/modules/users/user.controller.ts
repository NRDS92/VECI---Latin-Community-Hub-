import { Request, Response } from "express";
import * as usersService from "./user.service";
import { uploadImage } from "../../utils/upload.service";
import {User} from "./user.model";


export const toggleFavorite = async (req: Request<{ eventId: string }>, res: Response) => {
  try {
        const userId = (req as any).user.id;
        const { eventId } = req.params;
        const favorites = await usersService.toggleFavorite(
            userId,
            eventId
        );
        res.json({
        success: true,
        data: favorites,
        });
    } catch (error: any) {
        res.status(400).json({
        success: false,
        message: error.message,
        });
    }
};

export const uploadProfileImage = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const file = (req as any).file;

        if (!file) {
            throw new Error("No file uploaded");
        }

        const imageUrl = await uploadImage(file.path);

        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        user.profileImage = imageUrl;
        await user.save();

        res.json({
            success: true,
            data: user, // 👈 DEVUELVE USER COMPLETO
        });

    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const updatedUser = await usersService.updateUser(
        userId,
        req.body
        );

        res.json({
        success: true,
        data: updatedUser,
        });

    } catch (error: any) {
        res.status(400).json({
        success: false,
        message: error.message,
        });
    }
};
export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const user = await usersService.getMe(userId);

        res.json({
        success: true,
        data: user,
        });
    } catch (error: any) {
        res.status(400).json({
        success: false,
        message: error.message,
        });
    }
};
export const getFavorites = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const user = await User.findById(userId)
        .populate({
            path: "favorites",
            populate: [
            { path: "createdBy", select: "name profileImage" },
            { path: "businessId", select: "name category images" },
            ],
        });

        if (!user) {
        throw new Error("User not found");
        }

        res.json({
        success: true,
        data: user.favorites,
        });
    } catch (error: any) {
        res.status(400).json({
        success: false,
        message: error.message,
        });
    }
};