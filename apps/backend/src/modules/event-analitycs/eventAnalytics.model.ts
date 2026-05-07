import mongoose, { Schema, Document } from "mongoose";

export interface IEventAnalytics extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: "view" | "attend";
  createdAt: Date;
}

// 🔥 Añadimos el Model interface (CLAVE)
export interface IEventAnalyticsModel
  extends mongoose.Model<IEventAnalytics> {
  isUserAttending(
    eventId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<boolean>;
}

const EventAnalyticsSchema = new Schema<IEventAnalytics>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["view", "attend"],
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Índice correcto (lo mantenemos)
EventAnalyticsSchema.index(
  { eventId: 1, userId: 1, action: 1 },
  { unique: true }
);

// 🔥 MÉTODO ESTÁTICO (EL CAMBIO IMPORTANTE)
EventAnalyticsSchema.statics.isUserAttending = async function (
  eventId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
) {
  const record = await this.findOne({
    eventId,
    userId,
    action: "attend",
  }).lean(); // 🔥 pequeña optimización

  return !!record;
};

// 🔥 Export con tipado correcto
export const EventAnalytics = mongoose.model<
  IEventAnalytics,
  IEventAnalyticsModel
>("EventAnalytics", EventAnalyticsSchema);