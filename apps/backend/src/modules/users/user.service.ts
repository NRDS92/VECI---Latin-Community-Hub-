import { User, IUser } from "./user.model";

export const sanitizeUser = (user: IUser) => ({
  _id: user._id,
  name: user.name,
  email: user.email,

  role: user.role,
  provider: user.provider,

  subscription: {
    plan: user.subscription.plan,
    maxBusinesses: user.subscription.maxBusinesses,
  },

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

// --------------------------------------------------
// Toggle Favorite
// --------------------------------------------------

export const toggleFavorite = async (
  userId: string,
  eventId: string
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const isFavorite = user.favorites.some(
    (id) => id.toString() === eventId
  );

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

// --------------------------------------------------
// Update User
// --------------------------------------------------

export const updateUser = async (
  userId: string,
  data: {
    name?: string;
    cityId?: string;
    originCountry?: string;
    bio?: string;
    profileImage?: string;
    onboardingCompleted?: boolean;
  }
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (data.name !== undefined) {
    user.name = data.name.trim();
  }

  if (data.cityId !== undefined) {
    user.cityId = data.cityId;
  }

  if (data.originCountry !== undefined) {
    user.originCountry = data.originCountry.toUpperCase().trim();
  }

  if (data.bio !== undefined) {
    user.bio = data.bio.trim();
  }

  if (data.profileImage !== undefined) {
    user.profileImage = data.profileImage;
  }

  if (data.onboardingCompleted !== undefined) {
    user.onboardingCompleted = data.onboardingCompleted;
  }

  await user.save();

  return sanitizeUser(user);
};

// --------------------------------------------------
// Get Current User
// --------------------------------------------------

export const getMe = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return sanitizeUser(user);
};

// --------------------------------------------------
// Get Favorites
// --------------------------------------------------

export const getFavorites = async (userId: string) => {
  const user = await User.findById(userId).populate({
    path: "favorites",
    populate: [
      {
        path: "createdBy",
        select: "name profileImage",
      },
      {
        path: "businessId",
        select: "name category images",
      },
    ],
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.favorites;
};