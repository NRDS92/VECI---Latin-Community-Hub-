import { Request, Response } from "express";
import fs from "fs-extra";

import * as usersService from "./user.service";

import { uploadImage } from "../upload/upload.service";
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
            throw new Error("No file uploaded");
        }

        const imageUrl = await uploadImage(file.path);

        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        user.profileImage = imageUrl;

        await user.save();

        const updatedUser = await usersService.getMe(userId);

        return res.json({
            success: true,
            data: updatedUser,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    } finally {
        if (file?.path) {
            await fs.remove(file.path);
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