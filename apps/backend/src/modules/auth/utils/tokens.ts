import crypto from "crypto";

const TOKEN_SIZE = 32;

const generateToken = () => {
    return crypto.randomBytes(TOKEN_SIZE).toString("hex");
};

export const generateVerificationToken = () => generateToken();

export const generatePasswordResetToken = () => generateToken();