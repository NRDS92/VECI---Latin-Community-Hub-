import { IUser } from "../../modules/users/user.model";

export const sanitizeUser = (user: IUser) => ({
    _id: user._id,

    name: user.name,

    email: user.email,

    role: user.role,

    provider: user.provider,

    subscription: user.subscription,

    cityId: user.cityId,

    originCountry: user.originCountry,

    profileImage: user.profileImage,

    bio: user.bio,

    favorites: user.favorites,

    onboardingCompleted: user.onboardingCompleted,

    isVerified: user.isVerified,

    createdAt: user.createdAt,

    updatedAt: user.updatedAt,
});