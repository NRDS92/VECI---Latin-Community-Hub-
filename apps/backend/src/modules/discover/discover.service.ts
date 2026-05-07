import { Event } from "../events/event.model";
import { User } from "../users/user.model";
import { Business } from "../business/business.model";
import { calculateScore } from "./utils/calculateScore";

interface DiscoverParams {
  lat?: number;
  lng?: number;
  city?: string;
  category?: string;
  excludeCategory?: string;
  type?: "all" | "events" | "business";
  search?: string;
  userId?: string;
  page?: number;
  limit?: number;
  date?: string | null;
}

// 🧠 FILTER BUILDERS (PRODUCTION PATTERN)
const buildEventFilters = ({
  city,
  category,
  search,
  date,
}: any) => {
  const filters: any = {
    status: "active",
    $and: [],
  };

  // 🔥 FECHA (CLAVE)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  filters.$and.push({
    dateStart: { $gte: today },
  });

  if (city) {
    filters.$and.push({
      cityId: { $regex: city.trim(), $options: "i" },
    });
  }

  if (category && category !== "All") {
    filters.$and.push({
      category: category.toLowerCase(),
    });
  }

  if (search) {
    const regex = new RegExp(search, "i");

    filters.$and.push({
      $or: [
        { title: regex },
        { category: regex },
        { cityId: regex },
      ],
    });
  }

  if (filters.$and.length === 0) delete filters.$and;

  return filters;
};

const buildBusinessFilters = ({
  city,
  category,
  search,
  excludeCategory, // 🔥 NEW
}: any) => {
  const filters: any = {
    status: "active", // 🔥 te faltaba esto (importante)
    $and: [],
  };

  if (city) {
    filters.$and.push({
      "location.cityId": {
        $regex: city.trim(),
        $options: "i",
      },
    });
  }

  // ✅ INCLUDE CATEGORY
  if (category && category !== "All") {
    filters.$and.push({
      category: category.toLowerCase(),
    });
  }

  // 🔥 EXCLUDE CATEGORY (CLAVE DEL PROBLEMA)
  if (excludeCategory) {
    filters.$and.push({
      category: { $ne: excludeCategory },
    });
  }

  if (search) {
    const regex = new RegExp(search, "i");

    filters.$and.push({
      $or: [
        { name: regex },
        { category: regex },
        { "location.cityId": regex },
      ],
    });
  }

  if (filters.$and.length === 0) delete filters.$and;

  return filters;
};

export const getDiscoverFeed = async ({
  lat,
  lng,
  city,
  category,
  excludeCategory,
  type = "all",
  userId,
  page = 1,
  limit = 10,
  search = "",
  date = null,
}: DiscoverParams) => {
  const skip = (page - 1) * limit;

  // 🔥 FAVORITES
  let favoriteCategories: string[] = [];

  if (userId) {
    const user = await User.findById(userId).populate("favorites");

    if (user && user.favorites.length > 0) {
      favoriteCategories = user.favorites.map(
        (event: any) => event.category
      );
    }
  }

  // 🔥 FILTERS
  const eventFilters = buildEventFilters({
    city,
    category,
    search,
    date,
  });

  const businessFilters = buildBusinessFilters({
    city,
    category,
    search,
    excludeCategory,
  });

  // 🔥 FETCH
  const [events, businesses] = await Promise.all([
    type === "events" || type === "all"
      ? Event.find(eventFilters)
          .populate("createdBy", "name profileImage")
          .populate("businessId", "name images")
          .skip(skip)
          .limit(limit)
      : Promise.resolve([]),

    type === "business" || type === "all"
      ? Business.find(businessFilters)
          .skip(skip)
          .limit(limit)
      : Promise.resolve([]),
  ]);

  // 🔥 RANK EVENTS
  const rankedEvents = events
    .map((event) => {
      const score = calculateScore(
        event,
        lat || 0,
        lng || 0,
        favoriteCategories
      );

      return {
        ...event.toObject(),
        type: "event",
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  // 🔥 NORMALIZE BUSINESS
  const normalizedBusinesses = businesses.map((b) => ({
    ...b.toObject(),
    type: "business",
  }));

  // 🔥 MIX
  let mixedFeed: any[] = [];

  if (type === "events") {
    mixedFeed = rankedEvents;
  } else if (type === "business") {
    mixedFeed = normalizedBusinesses;
  } else {
    mixedFeed = [...rankedEvents, ...normalizedBusinesses];

    // shuffle simple
    mixedFeed = mixedFeed.sort(() => 0.5 - Math.random());
  }

  return {
    recommended: mixedFeed,
    page,
    hasMore: mixedFeed.length === limit,
  };
};