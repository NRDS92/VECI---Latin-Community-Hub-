import crypto from "crypto";

export const generateVerificationToken = () =>
  crypto.randomBytes(32).toString("hex");