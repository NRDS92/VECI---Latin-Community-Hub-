import { FeedItem } from "../../discover/types/discover.types";

export const MOCK_FEED: FeedItem[] = [
  {
    _id: "1",
    type: "event",
    title: "Reggaeton Night 🔥",
    category: "party",
    cityId: "Cologne",
    dateStart: new Date().toISOString(),
    eventType: "official",
    verificationStatus: "verified",
    images: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
    ],
    location: {
      type: "Point",
      coordinates: [6.96, 50.94],
    },
  },

  {
    _id: "2",
    type: "event",
    title: "Peruvian Food Festival 🇵🇪",
    category: "food",
    cityId: "Cologne",
    dateStart: new Date().toISOString(),
    eventType: "community",
    verificationStatus: "verified",
    images: [
      "https://images.unsplash.com/photo-1555992336-03a23c6b9c3d",
    ],
    location: {
      type: "Point",
      coordinates: [6.95, 50.93],
    },
  },

  // 🔥 AD CORRECTO
  {
    _id: "ad-1",
    type: "ad",
    isAd: true,
    title: "Promote your event 🚀",
    subtitle: "Reach the Latin community in Cologne",
    cta: "Publish now",
  },

  {
    _id: "3",
    type: "event",
    title: "Salsa Night 💃",
    category: "dance",
    cityId: "Cologne",
    dateStart: new Date().toISOString(),
    eventType: "official",
    verificationStatus: "pending",
    images: [
      "https://images.unsplash.com/photo-1504609813442-a8924e83f76e",
    ],
    location: {
      type: "Point",
      coordinates: [6.97, 50.92],
    },
  },
];