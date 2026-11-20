import dotenv from "dotenv";
import mongoose from "mongoose";
import { Business } from "../modules/business/business.model";
import { BusinessFollow } from "../modules/business/business-follow.model";

dotenv.config();

const apply = process.argv.includes("--apply");

const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI must be configured");
  await mongoose.connect(uri);
  try {
    const [businesses, groupedRelations] = await Promise.all([
      Business.find().select("_id followersCount").lean(),
      BusinessFollow.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
        { $group: { _id: "$businessId", count: { $sum: 1 } } },
      ]),
    ]);
    const counts = new Map(groupedRelations.map(({ _id, count }) => [String(_id), count]));
    const changes = businesses.flatMap((business) => {
      const count = counts.get(String(business._id)) ?? 0;
      return business.followersCount === count ? [] : [{ id: String(business._id), count }];
    });

    if (apply && changes.length) {
      await Business.bulkWrite(changes.map(({ id, count }) => ({
        updateOne: { filter: { _id: new mongoose.Types.ObjectId(id) }, update: { $set: { followersCount: count } } },
      })));
    }
    console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", businesses: businesses.length, countersToReconcile: changes.length }));
  } finally {
    await mongoose.disconnect();
  }
};

run().catch(async (error: unknown) => {
  console.error("Business follower reconciliation failed", error instanceof Error ? error.message : "Unknown error");
  await mongoose.disconnect();
  process.exitCode = 1;
});
