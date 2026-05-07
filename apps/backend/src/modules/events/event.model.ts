import mongoose, { Schema, Document, HydratedDocument } from "mongoose";

export interface IEvent extends Document {
    title: string;
    description?: string;

    eventType: "official" | "community";

    category:
        | "party"
        | "food"
        | "culture"
        | "sports"
        | "meetup"
        | "concert";

    cityId: string;
    images: string[];

    location: {
        type: "Point";
        coordinates: [number, number];
    };

    status: "active" | "blocked";

    address: string;

    dateStart: Date;
    dateEnd?: Date;

    createdBy: mongoose.Types.ObjectId;
    businessId?: mongoose.Types.ObjectId;

    stats: {
        views: number;
        attendees: number;
    };

    contact: {
        website?: string;
        instagram?: string;
        whatsapp?: string;
    };

    goodToKnow: string[];

    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
    {
        title: { type: String, required: true },
        description: String,

        eventType: {
            type: String,
            enum: ["official", "community"],
            required: true,
        },

        category: {
            type: String,
            enum: [
                "party",
                "food",
                "culture",
                "sports",
                "meetup",
                "concert",
            ],
            required: true,
        },

        images: {
            type: [String],
            default: [],
        },

        cityId: {
            type: String,
            required: true,
        },

        address: {
            type: String,
            required: true,
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },

        dateStart: {
            type: Date,
            required: true,
        },

        dateEnd: Date,

        // 🔥 USER
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // 🔥 BUSINESS
        businessId: {
            type: Schema.Types.ObjectId,
            ref: "Business",
        },
        stats: {
            views: { type: Number, default: 0 },
            attendees: { type: Number, default: 0 },
        },

        contact: {
            website: String,
            instagram: String,
            whatsapp: String,
        },

        goodToKnow: {
            type: [String],
            default: [],
        },

        status: {
            type: String,
            enum: ["active", "blocked"],
            default: "active",
        },
    },
    { timestamps: true }
);

EventSchema.index({ location: "2dsphere" });

export const Event = mongoose.model<IEvent>("Event", EventSchema);

export type EventDocument = HydratedDocument<IEvent>;