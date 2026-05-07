import { Request, Response } from "express";
import * as discoverService from "./discover.service";
import { Event } from "../events/event.model";
import { Business } from "../business/business.model";




export const getDiscoverFeed = async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat ? Number(req.query.lat) : undefined;
    const lng = req.query.lng ? Number(req.query.lng) : undefined;
    const date = req.query.date as string | undefined;
    const city = req.query.city as string | undefined;
    const category = req.query.category as string | undefined;
    const excludeCategory = req.query.excludeCategory as string | undefined; // 🔥 NEW
    const type = (req.query.type as "all" | "events" | "business") || "events";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const userId = (req as any).user?.id;
    const search = req.query.search as string | undefined;

    const data = await discoverService.getDiscoverFeed({
      lat,
      lng,
      city,
      category,
      excludeCategory, 
      type,
      userId,
      page,
      limit,
      search,
      date,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("DISCOVER ERROR:", error);

    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch discover feed",
    });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    let categories: string[] = [];

    if (type === "events") {
      categories = await Event.distinct("category");
    }

    if (type === "business") {
      categories = await Business.distinct("category");
    }

    if (type === "all") {
      const eventCats = await Event.distinct("category");
      const businessCats = await Business.distinct("category");

      categories = [...new Set([...eventCats, ...businessCats])];
    }

    res.json({
      success: true,
      data: categories.map((c) => ({ name: c })),
    });
  } catch (error) {
    console.error("CATEGORY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

export const getSearchSuggestions = async (req: Request, res: Response) => {
  try {
    const { q = "", type = "all" } = req.query;

    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const regex = new RegExp(q as string, "i");

    const [events, businesses] = await Promise.all([
      type === "events" || type === "all"
        ? Event.find({
            $or: [{ title: regex }, { category: regex }, { cityId: regex }],
          })
            .limit(5)
            .select("title category cityId")
        : [],

      type === "business" || type === "all"
        ? Business.find({
            $or: [
              { name: regex },
              { category: regex },
              { "location.cityId": regex },
            ],
          })
            .limit(5)
            .select("name category location")
        : [],
    ]);

    const suggestions = [
      ...events.map((e) => ({
        id: e._id,
        label: e.title,
        type: "event",
      })),
      ...businesses.map((b) => ({
        id: b._id,
        label: b.name,
        type: "business",
      })),
    ];

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("SUGGESTIONS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch suggestions",
    });
  }
};