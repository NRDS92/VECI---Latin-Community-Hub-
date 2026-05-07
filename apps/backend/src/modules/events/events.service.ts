import mongoose from "mongoose";
import { Event, IEvent } from "./event.model";
import { CreateEventInput } from "./events.validation";
import { AppError } from "../../shared/errors/AppError";
import { EventDocument } from "./event.model";


// 🚀 CREATE EVENT
export const createEvent = async (
    data: CreateEventInput,
    userId: string
) => {
    if (data.eventType === "official" && !data.businessId) {
        throw new AppError(
            "Official events require businessId",
            400,
            "BUSINESS_REQUIRED"
        );
    }
    const validImages = (data.images || []).filter((img) =>
        img.startsWith("http")
    );

    const event = new Event({
        title: data.title,
        description: data.description,
        category: data.category,
        eventType: data.eventType,
        cityId: data.cityId,
        address: data.address,
        images: validImages,

        location: {
            type: "Point",
            coordinates: [data.longitude, data.latitude],
        },
        contact: data.contact || {},

        dateStart: data.dateStart,
        dateEnd: data.dateEnd,

        createdBy: userId,
        businessId: data.businessId
        ? new mongoose.Types.ObjectId(data.businessId)
        : undefined,
        goodToKnow: data.goodToKnow || [],
    });

    await event.save();

    return event;
};

// 🚀 NEARBY
export const getNearbyEvents = async (
    lat: number,
    lng: number,
    options?: {
        radius?: number;
        category?: string;
        limit?: number;
    }
) => {
    const { radius = 10000, category, limit = 10 } = options || {};

    const query: Record<string, any> = {
        status: "active",
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [lng, lat],
                },
                $maxDistance: radius,
            },
        },
    };

    if (category) {
        query.category = category;
    }

    return Event.find(query)
        .sort({ dateStart: 1 })
        .limit(limit);
};

// 🚀 GET ALL
export const getEvents = async () => {
    return Event.find({ status: "active" }).sort({ dateStart: 1 });
};

// 🚀 GET BY ID
export const getEventById = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid event ID", 400, "INVALID_ID");
    }

    const event = await Event.findById(id)
        .populate("createdBy", "name profileImage")
        .populate("businessId", "name images")
        .lean();

    if (!event) {
        throw new AppError("Event not found", 404, "NOT_FOUND");
    }

    return event;
};

// 🚀 MY EVENTS (USER)
export const getEventsByUser = async (userId: string) => {
    return Event.find({ createdBy: userId }).sort({ createdAt: -1 });
};

export const getUpcomingEvents = async (limit = 10) => {
    return Event.find({
        status: "active",
        dateStart: { $gte: new Date() },
    })
        .sort({ dateStart: 1 })
        .limit(limit)
        .populate("createdBy", "name profileImage")
        .populate("businessId", "name images");
};
// 🚀 BUSINESS EVENTS
export const getEventsByBusiness = async (businessId: string) => {
    return Event.find({
        businessId: new mongoose.Types.ObjectId(businessId),
        eventType: "official",
        status: "active",
    }).sort({ dateStart: 1 });
};

// 🚀 UPDATE
export const updateEvent = async (
    eventId: string,
    userId: string,
    data: {
    title?: string;
    description?: string;
    images?: string[];
    category?: IEvent["category"];
    address?: string;
    cityId?: string;
    dateStart?: Date;
    dateEnd?: Date;
    contact?: IEvent["contact"];
    goodToKnow?: string[];
    latitude?: number;
    longitude?: number;
    businessId?: string;
}
) => {
    const event = await Event.findById(eventId) as EventDocument | null;

    if (!event) {
        throw new AppError("Event not found", 404, "NOT_FOUND");
    }

    if (event.createdBy.toString() !== userId) {
        throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    // 🔥 actualizar location si viene
    if (data.latitude && data.longitude) {
        event.location = {
            type: "Point",
            coordinates: [data.longitude, data.latitude],
        };
    }

    // 🔥 convertir businessId si viene
    if (data.businessId) {
        event.businessId = new mongoose.Types.ObjectId(data.businessId);
    }

    // 🔥 campos seguros
    if (data.title !== undefined) event.title = data.title;
    if (data.description !== undefined) event.description = data.description;
    if (data.images !== undefined) event.images = data.images;
    if (data.category !== undefined) event.category = data.category;
    if (data.address !== undefined) event.address = data.address;
    if (data.cityId !== undefined) event.cityId = data.cityId;
    if (data.dateStart !== undefined) event.dateStart = data.dateStart;
    if (data.dateEnd !== undefined) event.dateEnd = data.dateEnd;
    if (data.contact !== undefined) event.contact = data.contact;
    if (data.goodToKnow !== undefined) event.goodToKnow = data.goodToKnow;

    await event.save();

    return event;
};

// 🚀 DELETE
export const deleteEvent = async (
    eventId: string,
    userId: string
) => {
    const event = await Event.findById(eventId) as EventDocument | null;

    if (!event) {
        throw new AppError("Event not found", 404, "NOT_FOUND");
    }

    if (event.createdBy.toString() !== userId) {
        throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    await event.deleteOne();
};