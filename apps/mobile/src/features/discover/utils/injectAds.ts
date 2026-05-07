import { FeedItem } from "../types/discover.types";

type FeedItemWithAd = FeedItem & {
  isAd?: boolean;
};

export const injectAds = (items: FeedItem[]): FeedItemWithAd[] => {
  const result: FeedItemWithAd[] = [];

  items.forEach((item, index) => {
    result.push(item);

    // 👉 cada 3 items metemos un ad
    if ((index + 1) % 3 === 0) {
      result.push({
        _id: `ad-${index}`, // ✅ estable (NO random)
        type: "ad", // 🔥 CRÍTICO
        title: "Sponsored",
        category: "",
        cityId: "",
        dateStart: new Date().toISOString(),
        eventType: "official",
        location: {
          type: "Point",
          coordinates: [0, 0],
        },
        isAd: true,
      } as FeedItemWithAd);
    }
  });

  return result;
};