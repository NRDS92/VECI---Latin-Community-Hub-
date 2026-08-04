import mongoose from "mongoose";

import { User } from "../../users/user.model";

import { AppError } from "../../../shared/errors/AppError";

// ------------------------------------------------
// GET USERS
// ------------------------------------------------

export const getUsers = async () => {

    return User.find()
        .sort({
            createdAt: -1,
        });

};

// ------------------------------------------------
// GET USER
// ------------------------------------------------

export const getUserById = async (
    userId: string
) => {

    if (!mongoose.Types.ObjectId.isValid(userId)) {

        throw new AppError(
            "Invalid user id",
            400,
            "INVALID_ID"
        );

    }

    const user =
        await User.findById(userId);

    if (!user) {

        throw new AppError(
            "User not found",
            404,
            "NOT_FOUND"
        );

    }

    return user;

};

// ------------------------------------------------
// CHANGE ROLE
// ------------------------------------------------

export const changeUserRole = async (
    userId: string,
    role: "user" | "admin"
) => {

    const user =
        await getUserById(userId);

    user.role = role;

    await user.save();

    return user;

};

// ------------------------------------------------
// DELETE USER
// ------------------------------------------------

export const deleteUser = async (
    userId: string
) => {

    const user =
        await getUserById(userId);

    await user.deleteOne();

};