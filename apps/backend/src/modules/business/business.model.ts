import mongoose, { Schema, Document } from "mongoose";

export interface IBusiness extends Document {
  name: string;
  description: string;

  // 🧠 CATEGORY SYSTEM
  category:
    | "food"
    | "entertainment"
    | "services"
    | "shopping"
    | "education"
    | "health";

  subCategory?:
    | "restaurant"
    | "cafe"
    | "bar"
    | "bakery"
    | "club"
    | "event_venue"
    | "cultural_center"
    | "beauty_salon"
    | "barbershop"
    | "repair"
    | "agency"
    | "latin_store"
    | "supermarket"
    | "clothing"
    | "language_school"
    | "academy"
    | "clinic"
    | "gym";

  owner: mongoose.Types.ObjectId;

  images: {
    profile: string;
    cover?: string;
  };

  location: {
    address: string;
    cityId: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };

  contact: {
    email?: string;
    phone?: string;
    website?: string;
    instagram?: string;
    whatsapp?: string;
  };

  // 🧾 MENU (PDF)
  menu?: string;

  // 💰 PRICE RANGE
  priceRange?: "$" | "$$" | "$$$";

  tags: string[];
  languages: string[];

  isLatinoOwned: boolean;
  countryOfOrigin?: string;

  rating: {
    average: number;
    count: number;
  };

  likesCount: number;
  followersCount: number;
  eventsCount: number;

  verification: {
    status: "unverified" | "pending" | "verified" | "rejected";
    verifiedAt?: Date;
  };

  isFeatured: boolean;
  visibilityScore: number;

  status: "active" | "blocked";

  slug?: string;

  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: String,

    // 🧠 CATEGORY SYSTEM
    category: {
      type: String,
      enum: [
        "food",
        "entertainment",
        "services",
        "shopping",
        "education",
        "health",
      ],
      required: true,
    },

    subCategory: {
      type: String,
      enum: [
        // 🍽️ FOOD
        "restaurant",
        "cafe",
        "bar",
        "bakery",

        // 🎉 ENTERTAINMENT
        "club",
        "event_venue",
        "cultural_center",

        // 🛠️ SERVICES
        "beauty_salon",
        "barbershop",
        "repair",
        "agency",

        // 🛍️ SHOPPING
        "latin_store",
        "supermarket",
        "clothing",

        // 🎓 EDUCATION
        "language_school",
        "academy",

        // 🏥 HEALTH
        "clinic",
        "gym",
      ],
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    images: {
      profile: { type: String, required: true },
      cover: String,
    },

    location: {
      address: String,
      cityId: { type: String, required: true },
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    contact: {
      email: String,
      phone: String,
      website: String,
      instagram: String,
      whatsapp: String,
    },
    // 🧾 MENU
    menu: {
      type: String,
    },
    // 💰 PRICE RANGE
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$"],
    },
    tags: [String],
    languages: [String],
    isLatinoOwned: { type: Boolean, default: true },
    countryOfOrigin: String,
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    likesCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    eventsCount: { type: Number, default: 0 },
    verification: {
      status: {
        type: String,
        enum: ["unverified", "pending", "verified", "rejected"],
        default: "unverified",
      },
      verifiedAt: Date,
    },
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    slug: { type: String },

    visibilityScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Business = mongoose.model<IBusiness>(
  "Business",
  BusinessSchema
);