import mongoose from "mongoose";
import dotenv from "dotenv";
import { Event } from "../modules/events/event.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;
const events = [
{
"title": "Salsa Night Berlin 🔥",
"description": "Latin party with live DJ",
"eventType": "official",
"category": "party",
"cityId": "berlin",
"address": "Club Havana Berlin",
"latitude": 52.5200,
"longitude": 13.4050,
"dateStart": "2026-04-10"
},
{
"title": "Tacos Festival 🌮",
"description": "Best Mexican food in town",
"eventType": "official",
"category": "food",
"cityId": "berlin",
"address": "Street Food Arena",
"latitude": 52.5150,
"longitude": 13.4000,
"dateStart": "2026-04-12"
},
{
"title": "Latin Meetup Cologne 🤝",
"description": "Networking for latinos",
"eventType": "community",
"category": "meetup",
"cityId": "cologne",
"address": "Cafe Central",
"latitude": 50.9375,
"longitude": 6.9603,
"dateStart": "2026-04-08"
},
{
"title": "Reggaeton Party Hamburg 🎶",
"description": "Perreo all night",
"eventType": "official",
"category": "party",
"cityId": "hamburg",
"address": "Club Reeperbahn",
"latitude": 53.5511,
"longitude": 9.9937,
"dateStart": "2026-04-15"
},
{
"title": "Brazilian Food Market 🇧🇷",
"description": "Street food & drinks",
"eventType": "community",
"category": "food",
"cityId": "munich",
"address": "Food Market Munich",
"latitude": 48.1351,
"longitude": 11.5820,
"dateStart": "2026-04-20"
},
{
"title": "Latin Concert Frankfurt 🎤",
"description": "Live latin band",
"eventType": "official",
"category": "concert",
"cityId": "frankfurt",
"address": "Main Hall",
"latitude": 50.1109,
"longitude": 8.6821,
"dateStart": "2026-04-18"
},
{
"title": "Football Latinos ⚽",
"description": "Weekend football match",
"eventType": "community",
"category": "sports",
"cityId": "cologne",
"address": "City Stadium",
"latitude": 50.9400,
"longitude": 6.9600,
"dateStart": "2026-04-07"
},
{
"title": "Spanish Culture Night 🎭",
"description": "Dance & culture",
"eventType": "official",
"category": "culture",
"cityId": "berlin",
"address": "Cultural Center",
"latitude": 52.5205,
"longitude": 13.4095,
"dateStart": "2026-04-22"
},
{
"title": "Latin Rooftop Party 🌇",
"description": "Sunset vibes",
"eventType": "official",
"category": "party",
"cityId": "hamburg",
"address": "Sky Lounge",
"latitude": 53.5500,
"longitude": 9.9900,
"dateStart": "2026-04-25"
},
{
"title": "Empanadas Workshop 🥟",
"description": "Learn to cook",
"eventType": "community",
"category": "food",
"cityId": "munich",
"address": "Cooking Studio",
"latitude": 48.1400,
"longitude": 11.5800,
"dateStart": "2026-04-09"
},
{
"title": "Latin Tech Meetup 💻",
"description": "Developers networking",
"eventType": "community",
"category": "meetup",
"cityId": "berlin",
"address": "Tech Hub",
"latitude": 52.5180,
"longitude": 13.4100,
"dateStart": "2026-04-11"
},
{
"title": "Cumbia Night 💃",
"description": "Dance all night",
"eventType": "official",
"category": "party",
"cityId": "frankfurt",
"address": "Club Latino",
"latitude": 50.1120,
"longitude": 8.6800,
"dateStart": "2026-04-14"
},
{
"title": "Latin Cinema 🎬",
"description": "Movie night",
"eventType": "community",
"category": "culture",
"cityId": "cologne",
"address": "Cinema Hall",
"latitude": 50.9380,
"longitude": 6.9620,
"dateStart": "2026-04-16"
},
{
"title": "Street Food Fiesta 🍔",
"description": "Food trucks",
"eventType": "official",
"category": "food",
"cityId": "hamburg",
"address": "Market Square",
"latitude": 53.5520,
"longitude": 9.9950,
"dateStart": "2026-04-19"
},
{
"title": "Latin Yoga 🌿",
"description": "Relax & connect",
"eventType": "community",
"category": "sports",
"cityId": "munich",
"address": "Yoga Studio",
"latitude": 48.1360,
"longitude": 11.5810,
"dateStart": "2026-04-21"
},
{
"title": "Reggaeton Festival 🔥",
"description": "Biggest latin party",
"eventType": "official",
"category": "concert",
"cityId": "berlin",
"address": "Open Air Arena",
"latitude": 52.5220,
"longitude": 13.4080,
"dateStart": "2026-04-30"
},
{
"title": "Latin Entrepreneurs 🚀",
"description": "Startup networking",
"eventType": "community",
"category": "meetup",
"cityId": "frankfurt",
"address": "Business Hub",
"latitude": 50.1150,
"longitude": 8.6850,
"dateStart": "2026-04-13"
},
{
"title": "Bachata Night 💃",
"description": "Dance & fun",
"eventType": "official",
"category": "party",
"cityId": "cologne",
"address": "Dance Club",
"latitude": 50.9360,
"longitude": 6.9580,
"dateStart": "2026-04-17"
},
{
"title": "Latin Picnic 🌳",
"description": "Outdoor gathering",
"eventType": "community",
"category": "meetup",
"cityId": "hamburg",
"address": "City Park",
"latitude": 53.5540,
"longitude": 9.9970,
"dateStart": "2026-04-23"
},
{
"title": "Salsa Workshop 💃",
"description": "Learn salsa basics",
"eventType": "community",
"category": "culture",
"cityId": "berlin",
"address": "Dance Studio",
"latitude": 52.5190,
"longitude": 13.4070,
"dateStart": "2026-04-24"
}
]

const transformEvents = (events: any[], organizerId: string) => {
  return events.map((event) => ({
    title: event.title,
    description: event.description,
    eventType: event.eventType,
    category: event.category,
    cityId: event.cityId,
    address: event.address,

    location: {
      type: "Point",
      coordinates: [event.longitude, event.latitude],
    },

    dateStart: event.dateStart,
    organizerId,

    status: "active",
  }));
};
const seedEvents = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    // ⚠️ usa un user real de tu DB
    const organizerId = "69bb8d0bc040f18b561a453f";

    // borrar datos anteriores (opcional)
    await Event.deleteMany();

    const formattedEvents = transformEvents(events, organizerId);

    await Event.insertMany(formattedEvents);

    console.log("✅ Events seeded successfully");

    process.exit();
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedEvents();