import { User } from "./user.model";

export const toggleFavorite = async (
    userId: string,
    eventId: string
) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const isFavorite = user.favorites.includes(eventId as any);
    if (isFavorite) {
        user.favorites = user.favorites.filter(
        (id) => id.toString() !== eventId
        );
    } else {
        user.favorites.push(eventId as any);
    }
    await user.save();
    return user.favorites;
};

export const updateUser = async (
    userId: string,
    data: {
        name?: string;
        cityId?: string;
        bio?: string;
        profileImage?: string;
    }
    ) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    // 🔥 actualizar solo campos permitidos
    if (data.name !== undefined) user.name = data.name;
    if (data.cityId !== undefined) user.cityId = data.cityId;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.profileImage !== undefined)
        user.profileImage = data.profileImage;

    await user.save();

    return user;
};

export const getMe = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        cityId: user.cityId,
        profileImage: user.profileImage,
        bio: user.bio,
        favorites: user.favorites,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};