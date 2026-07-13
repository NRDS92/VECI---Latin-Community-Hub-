import bcrypt from "bcrypt";
import { User, AUTH_PROVIDERS } from "../users/user.model";
import { RegisterInput, LoginInput } from "./auth.types";
import { authenticateGoogleUser } from "./providers/google.provider";
import { generateJWT } from "../auth/utils/jwt";
import { AppError } from "../../shared/errors/AppError";
import {
    generateVerificationToken,
    generatePasswordResetToken,
} from "./utils/tokens";

import {
    sendVerificationEmail,
    sendPasswordResetEmail,
} from "./utils/email";


const sanitizeUser = (user: any) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    provider: user.provider,
    cityId: user.cityId,
    originCountry: user.originCountry,
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
        provider: AUTH_PROVIDERS.EMAIL,
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
    if (user.provider === AUTH_PROVIDERS.GOOGLE) {
        throw new AppError(
            "This account was created with Google. Please sign in with Google.",
            401,
            "GOOGLE_ACCOUNT"
        );
    }
    if (!user.passwordHash) {
    throw new AppError(
        "Password not available for this account.",
        401,
        "INVALID_CREDENTIALS"
    );
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

export const loginWithGoogle = async (
    idToken: string
) => {
    const googleUser = await authenticateGoogleUser(idToken);

    
    const email = googleUser.email.toLowerCase().trim();

    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({
            name: googleUser.name,
            email,
            provider: AUTH_PROVIDERS.GOOGLE,
            providerId: googleUser.sub,
            profileImage: googleUser.picture,
            isVerified: true,
        });
    } else {
        if (user.provider === AUTH_PROVIDERS.EMAIL) {
            if (!user.isVerified) {
                throw new AppError(
                    "An account with this email already exists but has not been verified. Please verify your email before signing in with Google.",
                    401,
                    "EMAIL_NOT_VERIFIED"
                );
            }

            throw new AppError(
                "An account with this email already exists. Please sign in with your email and password.",
                401,
                "EMAIL_ACCOUNT_EXISTS"
            );
        }

        // Compatibilidad con usuarios Google creados antes de agregar providerId
        if (!user.providerId) {
            user.providerId = googleUser.sub;
            await user.save();
        }
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

export const forgotPassword = async (
    email: string
) => {

    const emailNormalized = email.toLowerCase().trim();

    const user = await User.findOne({
        email: emailNormalized,
    });

    // Nunca revelar si el correo existe o no
    if (!user) {
        return true;
    }

    // Solo las cuentas EMAIL pueden recuperar contraseña
    if (user.provider !== AUTH_PROVIDERS.EMAIL) {
        return true;
    }

    const token = generatePasswordResetToken();

    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(
        Date.now() + 15 * 60 * 1000
    );

    await user.save();

    await sendPasswordResetEmail(
        user.email,
        token
    );

    return true;
};

export const resetPassword = async (
  token: string,
  password: string
) => {

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError(
      "Invalid or expired reset token.",
      400,
      "INVALID_RESET_TOKEN"
    );
  }

  user.passwordHash = await bcrypt.hash(password, 12);

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  return true;
};