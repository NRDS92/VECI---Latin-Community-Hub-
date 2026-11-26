import mongoose from "mongoose";
import dotenv from "dotenv";
import { BusinessFollow } from "../modules/business/business-follow.model";
import { BusinessBehavior } from "../modules/business/business-behavior.model";
import { BusinessBehaviorRateLimit } from "../modules/business/business-behavior-rate-limit.model";
import { User } from "../modules/users/user.model";

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGO_URI not defined in environment variables");
    }

    await mongoose.connect(mongoURI);

    // Ensure the compound uniqueness and retention indexes exist before engagement traffic is served.
    await Promise.all([
      BusinessFollow.createIndexes(),
      BusinessBehavior.createIndexes(),
      BusinessBehaviorRateLimit.createIndexes(),
      User.createIndexes(),
    ]);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
