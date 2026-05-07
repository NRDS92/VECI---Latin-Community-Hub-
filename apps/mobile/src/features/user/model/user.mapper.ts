import { User } from "./user.types";

export const mapUserFromApi = (data: any): User => ({
    id: data._id,
    name: data.name,
    email: data.email,
    role: data.role,
    cityId: data.cityId,
    profileImage: data.profileImage,
    bio: data.bio,
    favorites: data.favorites || [],
});