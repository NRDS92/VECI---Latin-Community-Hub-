import mongoose, { Schema, Document } from "mongoose";

export const AUTH_PROVIDERS = {
  EMAIL: "email",
  GOOGLE: "google",
} as const;

export type AuthProvider =
  (typeof AUTH_PROVIDERS)[keyof typeof AUTH_PROVIDERS];

// -------------------------
// Subscription Plans
// -------------------------

export const SUBSCRIPTION_PLANS = {
  FREE: "FREE",
  BUSINESS: "BUSINESS",
  BUSINESS_PRO: "BUSINESS_PRO",
  ENTERPRISE: "ENTERPRISE",
} as const;

export type SubscriptionPlan =
  (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  provider: AuthProvider;
  providerId?: string;

  role: "user" | "admin";

  subscription: {
      plan: SubscriptionPlan;
      maxBusinesses: number;
  };

  cityId?: string;
  originCountry?: string;
  profileImage?: string;
  bio?: string;

  favorites: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;

  isVerified: boolean;
  verificationToken?: string;

  onboardingCompleted: boolean;

  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    provider: {
      type: String,
      enum: Object.values(AUTH_PROVIDERS),
      default: AUTH_PROVIDERS.EMAIL,
    },

    providerId: {
      type: String,
      default: null,
    },

    passwordHash: {
      type: String,
      required: function (this: IUser) {
        return this.provider === AUTH_PROVIDERS.EMAIL;
      },
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    subscription: {
      plan: {
        type: String,
        enum: Object.values(SUBSCRIPTION_PLANS),
        default: SUBSCRIPTION_PLANS.FREE,
      },

      maxBusinesses: {
        type: Number,
        default: 1,
        min: 1,
      },
    },

    cityId: {
      type: String,
      default: null,
    },

    originCountry: {
      type: String,
      uppercase: true,
      trim: true,
      default: null,
    },

    profileImage: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      maxlength: 500,
      default: null,
    },

    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: null,
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", UserSchema);