import { EventAnalytics } from "./eventAnalytics.model";
import { Event } from "../events/event.model";

export const trackEventAction = async ({
  eventId,
  userId,
  action,
}: {
  eventId: string;
  userId: string;
  action: "view" | "attend";
}) => {
  try {
    // 🔥 evita duplicados
    const exists = await EventAnalytics.findOne({
      eventId,
      userId,
      action,
    });

    if (exists) return { already: true };

    // 🔥 guardar analytics
    await EventAnalytics.create({
      eventId,
      userId,
      action,
    });

    // 🔥 incrementar stats
    const field =
      action === "view" ? "stats.views" : "stats.attendees";

    await Event.findByIdAndUpdate(eventId, {
      $inc: { [field]: 1 },
    });

    return { already: false };
  } catch (error: any) {
    if (error.code === 11000) {
      return { already: true };
    }
    throw error;
  }
};