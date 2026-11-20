import { FeedItem } from "../types/discover.types";

export const injectAds = (items: FeedItem[]): FeedItem[] => {
  const result: FeedItem[] = [];

  items.forEach((item, index) => {
    result.push(item);

    // 👉 cada 3 items metemos un ad
    if ((index + 1) % 3 === 0) {
      result.push({
        _id: `ad-${index}`, // ✅ estable (NO random)
        type: "ad", // 🔥 CRÍTICO
        title: "Sponsored",
        isAd: true,
      });
    }
  });

  return result;
};
