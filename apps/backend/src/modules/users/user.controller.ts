import { Request, Response } from "express";
import fs from "fs-extra";

import * as usersService from "./user.service";

import {
    uploadUserProfileImage,
    deleteImage,
} from "../upload/upload.service";
import { User } from "./user.model";

// --------------------------------------------------
// Toggle Favorite
// --------------------------------------------------

export const toggleFavorite = async (
    req: Request<{ eventId: string }>,
    res: Response
) => {
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

// --------------------------------------------------
// Upload Profile Image
// --------------------------------------------------


export const uploadProfileImage = async (
    req: Request,
    res: Response
) => {
    const file = (req as any).file;

    try {
        const userId = (req as any).user.id;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const uploaded = await uploadUserProfileImage(file.path);
        const previousPublicId = user.profileImagePublicId;

        try {
            user.profileImage = uploaded.url;
            user.profileImagePublicId = uploaded.publicId;
            await user.save();
        } catch (error) {
            await deleteImage(uploaded.publicId).catch(() => undefined);
            throw error;
        }

        if (
            previousPublicId &&
            previousPublicId !== uploaded.publicId
        ) {
            await deleteImage(previousPublicId).catch((error) => {
                console.error(
                    "Failed to delete previous profile image:",
                    error
                );
            });
        }

        const updatedUser = await usersService.getMe(userId);

        return res.json({
            success: true,
            data: updatedUser,
        });
    } catch (error) {
        console.error("Profile image upload failed:", error);

        return res.status(500).json({
            success: false,
            message: "Could not update profile image",
        });
    } finally {
        if (file?.path) {
            await fs.remove(file.path).catch(() => undefined);
        }
    }
};


// --------------------------------------------------
// Update User
// --------------------------------------------------


export const updateUser = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = (req as any).user.id;
        const body = req.body;

        if (
            typeof body !== "object" ||
            body === null ||
            Array.isArray(body)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid request body",
            });
        }

        const allowedFields = [
            "name",
            "cityId",
            "originCountry",
            "bio",
            "onboardingCompleted",
        ];

        const unexpectedFields = Object.keys(body).filter(
            (key) => !allowedFields.includes(key)
        );

        if (unexpectedFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Unsupported profile fields",
            });
        }

        const updatedUser = await usersService.updateUser(
            userId,
            body
        );

        return res.json({
            success: true,
            data: updatedUser,
        });
    } catch (error) {
        console.error("Profile update failed:", error);

        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Could not update profile",
        });
    }
};


// --------------------------------------------------
// Get Me
// --------------------------------------------------

export const getMe = async (
  req: Request,
  res: Response
) => {
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

// --------------------------------------------------
// Get Favorites
// --------------------------------------------------

export const getFavorites = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;

    const favorites = await usersService.getFavorites(userId);

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