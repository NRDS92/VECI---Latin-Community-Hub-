import { Request, Response } from "express";
import * as eventsService from "./events.service";
import { createEventSchema, updateEventSchema  } from "./events.validation";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../shared/errors/AppError";
import { Event } from "../events/event.model";
import { EventAnalytics } from "../event-analitycs/eventAnalytics.model";
import { User } from "../users/user.model";
import mongoose from "mongoose";


// CREATE EVENT
export const createEvent = catchAsync(async (req: Request, res: Response) => {
    delete req.body.organizerId;
    delete req.body.createdBy;
    delete req.body.stats;
    delete req.body.status;

    const parsedData = createEventSchema.parse(req.body);

    const userId = (req as any).user.id;

    const event = await eventsService.createEvent(
        parsedData,
        userId
    );

    res.status(201).json({
        success: true,
        data: event,
    });
});

//  NEARBY EVENTS
export const getNearbyEvents = catchAsync(async (req: Request, res: Response) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius) || 10000;

    if (!lat || !lng) {
        throw new AppError("lat and lng are required", 400, "VALIDATION_ERROR");
    }

    const events = await eventsService.getNearbyEvents(lat, lng, { radius });

    res.json({
        success: true,
        data: events,
    });
});

// 📦 GET ALL
export const getEvents = catchAsync(async (_req: Request, res: Response) => {
    const events = await eventsService.getEvents();

    res.json({
        success: true,
        data: events,
    });
});

//  GET BY ID
export const getEventById = catchAsync(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const event = await eventsService.getEventById(id);

    if (!event) {
        throw new AppError("Event not found", 404, "NOT_FOUND");
    }

    let userContext = null;

    const userId = (req as any).user?.id;
    
    if (userId) {
        const [isAttending, user] = await Promise.all([
            EventAnalytics.isUserAttending(
                new mongoose.Types.ObjectId(id),
                new mongoose.Types.ObjectId(userId)
            ),
            User.findById(userId).select("favorites").lean(),
        ]);

        const isFavorite = user?.favorites?.some(
            (favId: any) => favId.toString() === id
        );

        userContext = {
            isAttending,
            isFavorite: !!isFavorite,
        };
    }

    res.json({
        success: true,
        data: {
            ...event,
            userContext,
        },
    });
});

//  MY EVENTS
export const getMyEvents = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const events = await eventsService.getEventsByUser(userId);

    res.json({
        success: true,
        data: events,
    });
});


//  UPDATE
export const updateEvent = catchAsync(async (req: Request<{ id: string }>, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // 🔥 campos permitidos SOLAMENTE
    const allowedFields = [
        "title",
        "description",
        "images",
        "category",
        "address",
        "cityId",
        "dateStart",
        "dateEnd",
        "contact",
        "goodToKnow",
        
    ];

    const filteredBody: any = {};

    for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
            filteredBody[key] = req.body[key];
        }
    }

    const parsedData = updateEventSchema.parse(filteredBody);

    const updatedEvent = await eventsService.updateEvent(
        id,
        userId,
        parsedData
    );

    res.json({
        success: true,
        data: updatedEvent,
    });
});


export const trackView = catchAsync(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const userId = (req as any).user?.id;

    // 🔥 SOLO trackea si hay usuario
    if (userId) {
        await trackEventAction({
            eventId: id,
            userId,
            action: "view",
        });
    } else {
        // opcional: solo incrementar views sin analytics
        await Event.findByIdAndUpdate(id, {
            $inc: { "stats.views": 1 },
        });
    }

    res.json({ success: true });
});

import { trackEventAction } from "../event-analitycs/eventAnalytics.service";

export const attendEvent = catchAsync(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.id;
    console.log("🔥 ATTEND USER:", (req as any).user);

    const result = await trackEventAction({
        eventId: id,
        userId,
        action: "attend",
    });

    res.json({
        success: true,
        message: result.already
            ? "Already attending"
            : "Attending confirmed",
    });
});
//  DELETE
export const deleteEvent = catchAsync(async (req: Request<{ id: string }>, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;

    await eventsService.deleteEvent(id, userId);

    res.json({
        success: true,
        message: "Event deleted",
    });
});

// EVENTS BY BUSINESS
export const getEventsByBusiness = catchAsync(async (req: Request<{ businessId: string }>, res: Response) => {
    const { businessId } = req.params;

    const events = await eventsService.getEventsByBusiness(businessId);

    res.json({
        success: true,
        data: events,
    });
});

