import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const generateJWT = (user: any) => {
  return jwt.sign(
    {
      userId: user._id,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};