import mongoose, { Schema, Document, HydratedDocument } from "mongoose";
import {
    ModerationStatus,
    ModerationRejectionReason,
} from "../../shared/constants/moderation";
import { ModerationSchema } from "../../shared/moderation/moderation.schema";

export interface IEvent extends Document {
    title: string;
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
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
    moderation: {
        status: ModerationStatus;
        reviewedBy?: mongoose.Types.ObjectId;
        reviewedAt?: Date;
        rejectionReason?: ModerationRejectionReason;
        rejectionComment?: string;
    };
    price?: {
        type: "free" | "paid";
        amount?: number;
        currency: "EUR";
    };

    links: {
        label: string;
        url: string;
    }[];
    address: string;
    attachment?: {
        url: string;
        publicId: string;
        name: string;
        size: number;
    };
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
        price: {
            type: {
                type: String,
                enum: ["free", "paid"],
                required: true,
            },
            amount: {
                type: Number,
                min: 0,
            },
            currency: {
                type: String,
                enum: ["EUR"],
                default: "EUR",
            },
        },
        links: {
            type: [
                {
                    label: {
                        type: String,
                        required: true,
                        maxlength: 80,
                    },
                    url: {
                        type: String,
                        required: true,
                        maxlength: 2048,
                    },
                },
            ],
            default: [],
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
        attachment: {
            type: {
                url: { type: String, required: true },
                publicId: { type: String, required: true },
                name: { type: String, required: true },
                size: { type: Number, required: true },
            },
            required: false,
        },
        status: {
            type: String,
            enum: ["active", "blocked"],
            default: "active",
        },
        moderation: {
            type: ModerationSchema,
            default: () => ({}),
        },
    },
    { timestamps: true }
);

EventSchema.index({ location: "2dsphere" });

export const Event = mongoose.model<IEvent>("Event", EventSchema);

export type EventDocument = HydratedDocument<IEvent>;