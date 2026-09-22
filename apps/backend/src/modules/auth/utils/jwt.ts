import jwt from "jsonwebtoken";
import { IUser } from "../../users/user.model";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

export const generateJWT = (user: IUser): string => {
    return jwt.sign(
        {
            userId: user._id.toString(),
        },
        JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
};