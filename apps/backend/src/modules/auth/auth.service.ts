import bcrypt from "bcrypt";
import { User } from "../users/user.model";
import { RegisterInput, LoginInput } from "./auth.types";
import { verifyGoogleToken } from "./providers/google.provider";
import { generateJWT } from "../auth/utils/jwt";
import { generateVerificationToken } from "./utils/tokens";
import { sendVerificationEmail } from "./utils/email";
import { AppError } from "../../shared/errors/AppError";

const sanitizeUser = (user: any) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        cityId: user.cityId,
        profileImage: user.profileImage,
        favorites: user.favorites,
        bio: user.bio,
        onboardingCompleted: user.onboardingCompleted,
});

export const registerUser = async (data: RegisterInput) => {
    const { name, email, password, cityId } = data;

    if (!email || !password) {
        throw new AppError("Missing credentials", 400, "VALIDATION_ERROR");
    }

    const emailNormalized = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: emailNormalized });

    if (existingUser) {
        throw new AppError("User already exists", 400, "USER_EXISTS");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = generateVerificationToken();

    const user = await User.create({
        name,
        email: emailNormalized,
        passwordHash,
        cityId,
        verificationToken,
        isVerified: false,
    });

    await sendVerificationEmail(user.email, verificationToken);

    return sanitizeUser(user);
};

export const loginUser = async (data: LoginInput) => {
    const { email, password } = data;

    if (!email || !password) {
        throw new AppError("Missing credentials", 400, "VALIDATION_ERROR");
    }

    const emailNormalized = email.toLowerCase().trim();

    const user = await User.findOne({ email: emailNormalized });

    if (!user) {
        throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    if (!user.isVerified) {
        throw new AppError("Please verify your email", 401, "EMAIL_NOT_VERIFIED");
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
        throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const token = generateJWT(user);

    return {
        user: sanitizeUser(user),
        token,
    };
};

export const loginWithGoogle = async (accessToken: string) => {
    const googleUser = await verifyGoogleToken(accessToken);

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
        user = await User.create({
        email: googleUser.email,
        name: googleUser.name,
        profileImage: googleUser.picture,
        isVerified: true,
        });
    }

    const token = generateJWT(user);

    return {
        user: sanitizeUser(user),
        token,
    };
};


export const verifyEmailToken = async (token: string) => {
    const user = await User.findOne({ verificationToken: token });

    if (!user || !user.verificationToken) {
        throw new AppError("Invalid or expired token", 400, "INVALID_TOKEN");
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    return true;
};

export const deleteUserAccount = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError("User not found", 404, "NOT_FOUND");
    }

    await User.findByIdAndDelete(userId);

    return true;
};