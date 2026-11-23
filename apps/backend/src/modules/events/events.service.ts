import mongoose from "mongoose";
import { Event, IEvent } from "./event.model";
import { CreateEventInput } from "./events.validation";
import { AppError } from "../../shared/errors/AppError";
import { EventDocument } from "./event.model";
import { MODERATION_STATUS } from "../../shared/constants/moderation";
import { approvedModerationFilter } from "../../shared/moderation/moderation.filter";
import {
    uploadPdf,
    deletePdf,
} from "../upload/upload.service";
import { generateUniqueSlug } from "../../shared/slug/slug.service";
import { Business } from "../business/business.model";
import { Community, CommunityMembership } from "../community/community.models";
import type { UpdateEventInput } from "./events.validation";
import { AvailableEventOrganizerSchema } from "@ndrs92/contracts";

const resolveSubmittedOrganizer = (data: CreateEventInput) => {
    if (data.organizer) return { type: data.organizer.type, id: data.organizer.id };
    if (data.businessId) return { type: "business" as const, id: data.businessId };
    throw new AppError("An approved Business or Community organizer is required", 400, "ORGANIZER_REQUIRED");
};

const authorizeOrganizer = async (organizer: { type: "business" | "community"; id: string }, userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(organizer.id)) throw new AppError("Invalid organizer ID", 400, "INVALID_ID");
    if (organizer.type === "business") {
        const business = await Business.findById(organizer.id).select("owner status moderation.status");
        if (!business) throw new AppError("Business organizer not found", 404, "NOT_FOUND");
        if (business.status !== "active" || business.moderation?.status !== MODERATION_STATUS.APPROVED) {
            throw new AppError("Business organizer must be approved and active", 403, "ORGANIZER_UNAVAILABLE");
        }
        if (String(business.owner) !== userId) throw new AppError("Business owner permission required", 403, "FORBIDDEN");
        return new mongoose.Types.ObjectId(organizer.id);
    }

    const community = await Community.findById(organizer.id).select("status moderation.status");
    if (!community) throw new AppError("Community organizer not found", 404, "NOT_FOUND");
    if (community.status !== "active" || community.moderation?.status !== MODERATION_STATUS.APPROVED) {
        throw new AppError("Community organizer must be approved and active", 403, "ORGANIZER_UNAVAILABLE");
    }
    const membership = await CommunityMembership.findOne({
        communityId: community._id, userId: new mongoose.Types.ObjectId(userId), status: "active", role: { $in: ["owner", "admin"] },
    });
    if (!membership) throw new AppError("Community Owner/Admin permission required", 403, "FORBIDDEN");
    return new mongoose.Types.ObjectId(organizer.id);
};

const eventOrganizerDto = async (event: any) => {
    const source = event?.toObject ? event.toObject() : event;
    const organizer = source.organizer ?? (source.businessId ? { type: "business", id: source.businessId } : undefined);
    if (!organizer) return source;
    const entity = organizer.type === "community"
        ? await Community.findOne({ _id: organizer.id, status: "active", "moderation.status": MODERATION_STATUS.APPROVED }).select("slug name images.profile").lean()
        : await Business.findOne({ _id: organizer.id, status: "active", "moderation.status": MODERATION_STATUS.APPROVED }).select("slug name images.profile").lean();
    if (!entity) return null;
    const organizerId = String(organizer.id?._id ?? organizer.id);
    return {
        ...source,
        organizer: {
            type: organizer.type,
            id: organizerId,
            slug: entity.slug,
            name: entity.name,
            ...(entity.images?.profile ? { image: entity.images.profile } : {}),
        },
    };
};

export const canManageEvent = async (event: IEvent, userId: string) => {
    const organizer = event.organizer ?? (event.businessId ? { type: "business" as const, id: event.businessId } : undefined);
    if (!organizer) return String(event.createdBy) === userId;
    if (organizer.type === "business") {
        const business = await Business.findById(organizer.id).select("owner");
        return !!business && String(business.owner) === userId;
    }
    return Boolean(await CommunityMembership.exists({ communityId: organizer.id, userId, status: "active", role: { $in: ["owner", "admin"] } }));
};

// 🚀 CREATE EVENT
export const createEvent = async (
    data: CreateEventInput,
    userId: string
) => {
    const submittedOrganizer = resolveSubmittedOrganizer(data);
    if (data.eventType === "official" && submittedOrganizer.type !== "business") {
        throw new AppError("Official events require a Business organizer", 400, "BUSINESS_REQUIRED");
    }
    const organizerId = await authorizeOrganizer(submittedOrganizer, userId);
    const slug = await generateUniqueSlug({
        model: Event,
        value: data.title,
    });
    console.log("🔥 GENERATED EVENT SLUG:", slug);
    const validImages = (data.images || []).filter((img) =>
        img.startsWith("http")
    );
    const event = new Event({
        title: data.title,
        slug,
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
        price: data.price,
        links: data.links || [],
        contact: data.contact || {},
        dateStart: data.dateStart,
        dateEnd: data.dateEnd,
        createdBy: userId,
        organizer: { type: submittedOrganizer.type, id: organizerId },
        businessId: submittedOrganizer.type === "business" ? organizerId : undefined,
        goodToKnow: data.goodToKnow || [],
        moderation: {
            status: MODERATION_STATUS.PENDING,
        },
    });
    await event.save();
    return event;
};

export const getAvailableEventOrganizers = async (userId: string) => {
    const user = new mongoose.Types.ObjectId(userId);
    const [businesses, memberships] = await Promise.all([
        Business.find({ owner: user, status: "active", "moderation.status": MODERATION_STATUS.APPROVED })
            .select("name slug images.profile").lean(),
        CommunityMembership.find({ userId: user, role: { $in: ["owner", "admin"] }, status: "active" })
            .select("communityId").lean(),
    ]);
    const communities = memberships.length
        ? await Community.find({
            _id: { $in: memberships.map((membership) => membership.communityId) },
            status: "active", "moderation.status": MODERATION_STATUS.APPROVED,
        }).select("name slug images.profile").lean()
        : [];
    return [
        ...businesses.map((business) => AvailableEventOrganizerSchema.parse({
            type: "business", id: String(business._id), name: business.name, slug: business.slug,
            ...(business.images?.profile ? { image: business.images.profile } : {}),
        })),
        ...communities.map((community) => AvailableEventOrganizerSchema.parse({
            type: "community", id: String(community._id), name: community.name, slug: community.slug,
            ...(community.images?.profile ? { image: community.images.profile } : {}),
        })),
    ];
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
        ...approvedModerationFilter,
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

    const events = await Event.find(query)
        .sort({ dateStart: 1 })
        .limit(limit);
    const mapped = await Promise.all(events.map(eventOrganizerDto));
    return mapped.filter(Boolean);
};

// 🚀 GET ALL
export const getEvents = async () => {
    const events = await Event.find({
        status: "active",
        ...approvedModerationFilter,
    }).sort({ dateStart: 1 });
    const mapped = await Promise.all(events.map(eventOrganizerDto));
    return mapped.filter(Boolean);
};
// GET BY SLUG
export const getEventBySlug = async (slug: string) => {
    const event = await Event.findOne({
        slug,
        status: "active",
        ...approvedModerationFilter,
    })
        .populate("createdBy", "name profileImage")
        .populate("businessId", "name images")
        .lean();

    return event ? eventOrganizerDto(event) : null;
};
// 🚀 GET BY ID
export const getEventById = async (id: string, userId?: string) => {
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
    if (event.status !== "active" || event.moderation.status !== MODERATION_STATUS.APPROVED) {
        if (!userId || !(await canManageEvent(event as unknown as IEvent, userId))) {
            throw new AppError("Event not found", 404, "NOT_FOUND");
        }
    }
    return eventOrganizerDto(event);
};

// 🚀 MY EVENTS (USER)
export const getEventsByUser = async (userId: string) => {
    const events = await Event.find({ createdBy: userId }).sort({ createdAt: -1 });
    return Promise.all(events.map(eventOrganizerDto));
};

export const getUpcomingEvents = async (limit = 10) => {
    const events = await Event.find({
        status: "active",
        dateStart: { $gte: new Date() },
    })
        .sort({ dateStart: 1 })
        .limit(limit)
        .populate("createdBy", "name profileImage")
        .populate("businessId", "name images");
    const mapped = await Promise.all(events.map(eventOrganizerDto));
    return mapped.filter(Boolean);
};
// 🚀 BUSINESS EVENTS
export const getEventsByBusiness = async (businessId: string) => {
    const events = await Event.find({
        businessId: new mongoose.Types.ObjectId(businessId),
        eventType: "official",
        status: "active",
        ...approvedModerationFilter,
    }).sort({ dateStart: 1 });
    const mapped = await Promise.all(events.map(eventOrganizerDto));
    return mapped.filter(Boolean);
};

// 🚀 UPDATE
export const updateEvent = async (
    eventId: string,
    userId: string,
    data: UpdateEventInput
) => {
    const event = await Event.findById(eventId) as EventDocument | null;

    if (!event) {
        throw new AppError("Event not found", 404, "NOT_FOUND");
    }

    if (!(await canManageEvent(event, userId))) {
        throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    if (data.eventType === "official" && event.organizer?.type === "community") {
        throw new AppError("A Community organizer cannot be changed into an official Business Event", 409, "ORGANIZER_IMMUTABLE");
    }

    // 🔥 actualizar location si viene
    if ((data.latitude === undefined) !== (data.longitude === undefined)) {
        throw new AppError("Latitude and longitude must be updated together", 400, "VALIDATION_ERROR");
    }
    if (data.latitude !== undefined && data.longitude !== undefined) {
        event.location = {
            type: "Point",
            coordinates: [data.longitude, data.latitude],
        };
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
    if (data.contact !== undefined) event.contact = { ...event.contact, ...data.contact };
    if (data.goodToKnow !== undefined) event.goodToKnow = data.goodToKnow;
    if (data.price !== undefined) event.price = data.price;
    if (data.links !== undefined) event.links = data.links;

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

    if (!(await canManageEvent(event, userId))) {
        throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    await event.deleteOne();
};

export const uploadEventAttachment = async (
    event: EventDocument,
    file: Express.Multer.File
) => {
    const previousAttachment = event.attachment;

    // 1. Subir primero el nuevo PDF
    const uploadedPdf = await uploadPdf(file.path);

    try {
        // 2. Guardar el nuevo PDF en MongoDB
        event.attachment = {
            url: uploadedPdf.url,
            publicId: uploadedPdf.publicId,
            name: file.originalname,
            size: file.size,
        };

        await event.save();
    } catch (error) {
        // 3. Si MongoDB falla, eliminar el nuevo PDF
        // para evitar dejarlo huérfano en Cloudinary.
        try {
            await deletePdf(uploadedPdf.publicId);
        } catch (cleanupError) {
            console.error(
                "Failed to cleanup newly uploaded PDF:",
                cleanupError
            );
        }

        throw error;
    }

    // 4. MongoDB ya apunta al nuevo PDF.
    // Ahora podemos eliminar el anterior.
    if (previousAttachment?.publicId) {
        try {
            await deletePdf(previousAttachment.publicId);
        } catch (error) {
            // El evento ya está correctamente actualizado.
            // Solo queda un recurso antiguo en Cloudinary para limpiar.
            console.error(
                "Failed to delete previous event PDF:",
                error
            );
        }
    }

    return event.attachment;
};
