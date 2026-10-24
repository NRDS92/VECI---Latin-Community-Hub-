
import mongoose from "mongoose";
import dotenv from "dotenv";

import { Event, type IEvent } from "../modules/events/event.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const ORGANIZER_ID = process.env.SEED_ORGANIZER_ID;

const CITIES = [
  {
    id: "berlin",
    name: "Berlín",
    latitude: 52.52,
    longitude: 13.405,
    count: 12,
  },
  {
    id: "cologne",
    name: "Colonia",
    latitude: 50.9375,
    longitude: 6.9603,
    count: 8,
  },
  {
    id: "hamburg",
    name: "Hamburgo",
    latitude: 53.5511,
    longitude: 9.9937,
    count: 7,
  },
  {
    id: "munich",
    name: "Múnich",
    latitude: 48.1351,
    longitude: 11.582,
    count: 7,
  },
  {
    id: "frankfurt",
    name: "Fráncfort",
    latitude: 50.1109,
    longitude: 8.6821,
    count: 6,
  },
  {
    id: "dusseldorf",
    name: "Düsseldorf",
    latitude: 51.2277,
    longitude: 6.7735,
    count: 5,
  },
  {
    id: "stuttgart",
    name: "Stuttgart",
    latitude: 48.7758,
    longitude: 9.1829,
    count: 5,
  },
] as const;

const TEMPLATES = [
  {
    title: "Noche de Salsa",
    description:
      "Evento de demostración de música y baile latinoamericano.",
    eventType: "community",
    category: "party",
    daysAhead: 7,
  },
  {
    title: "Festival de Gastronomía Latina",
    description:
      "Evento de demostración dedicado a los sabores de América Latina.",
    eventType: "community",
    category: "food",
    daysAhead: 10,
  },
  {
    title: "Encuentro Cultural Latinoamericano",
    description:
      "Evento de demostración sobre las tradiciones y culturas latinoamericanas.",
    eventType: "community",
    category: "culture",
    daysAhead: 14,
  },
  {
    title: "Fútbol de la Comunidad Latina",
    description:
      "Actividad deportiva de demostración para conectar a la comunidad.",
    eventType: "community",
    category: "sports",
    daysAhead: 3,
  },
  {
    title: "Encuentro de la Comunidad Latina",
    description:
      "Reunión de demostración para conocer gente y compartir experiencias.",
    eventType: "community",
    category: "meetup",
    daysAhead: 5,
  },
  {
    title: "Concierto de Música Latina",
    description:
      "Evento de demostración de música latinoamericana en vivo.",
    eventType: "community",
    category: "concert",
    daysAhead: 21,
  },
  {
    title: "Taller de Empanadas",
    description:
      "Actividad gastronómica de demostración inspirada en recetas latinoamericanas.",
    eventType: "community",
    category: "food",
    daysAhead: 12,
  },
  {
    title: "Noche de Bachata",
    description:
      "Evento de demostración dedicado al baile y la música latina.",
    eventType: "community",
    category: "party",
    daysAhead: 17,
  },
  {
    title: "Cine Latinoamericano",
    description:
      "Propuesta de demostración para descubrir películas de América Latina.",
    eventType: "community",
    category: "culture",
    daysAhead: 24,
  },
  {
    title: "Networking Latino",
    description:
      "Encuentro de demostración para profesionales y emprendedores latinos.",
    eventType: "community",
    category: "meetup",
    daysAhead: 8,
  },
] as const;

const slugify = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getFutureDate = (daysAhead: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(18, 0, 0, 0);
  return date;
};

const buildSeedEvents = (): Partial<IEvent>[] => {
  const result: Partial<IEvent>[] = [];
  let globalIndex = 0;

  for (const city of CITIES) {
    for (let i = 0; i < city.count; i++) {
      const template = TEMPLATES[globalIndex % TEMPLATES.length];
      const suffix = String(globalIndex + 1).padStart(3, "0");

      result.push({
        title: `${template.title} — ${city.name} #${suffix}`,

        slug: slugify(
          `${template.title}-${city.id}-demo-${suffix}`
        ),

        description: template.description,
        eventType: template.eventType,
        category: template.category,
        cityId: city.id,

        // Coordenadas aproximadas del centro de la ciudad.
        // No representan el lugar real de un evento.
        location: {
          type: "Point",
          coordinates: [city.longitude, city.latitude],
        },

        address: `Ubicación de demostración — ${city.name}. Confirmar antes de publicar.`,

        dateStart: getFutureDate(
          template.daysAhead +
            Math.floor(globalIndex / 10) * 7
        ),

        price: {
          type: "free",
          currency: "EUR",
        },

        images: [],
        links: [],
        contact: {},

        goodToKnow: [
          "EVENTO DE DEMOSTRACIÓN",
          "Fecha, dirección y disponibilidad pendientes de verificación.",
        ],

        createdBy: new mongoose.Types.ObjectId(ORGANIZER_ID!),
        status: "active",

        // No forzamos la aprobación de moderación.
      });

      globalIndex++;
    }
  }

  return result;
};

async function seedEvents(): Promise<void> {
  if (!MONGO_URI) {
    throw new Error(
      "Falta MONGO_URI en las variables de entorno."
    );
  }

  if (
    !ORGANIZER_ID ||
    !mongoose.Types.ObjectId.isValid(ORGANIZER_ID)
  ) {
    throw new Error(
      "Define SEED_ORGANIZER_ID con el ObjectId de un usuario válido."
    );
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB conectado.");

    const organizerObjectId =
      new mongoose.Types.ObjectId(ORGANIZER_ID);

    const organizer = await mongoose.connection
      .collection("users")
      .findOne({ _id: organizerObjectId });

    if (!organizer) {
      throw new Error(
        "No se encontró el usuario organizador en la colección users."
      );
    }

    const events = buildSeedEvents();

    console.log(`Eventos preparados: ${events.length}`);

    // Validar todos los documentos antes de insertar.
    for (const data of events) {
      const document = new Event(data);
      await document.validate();
    }

    console.log("Validación correcta de todos los eventos.");

    let inserted = 0;
    let existing = 0;

    // Insertar sin sobrescribir los eventos existentes.
    for (const event of events) {
      if (!event.slug) {
        throw new Error("Se encontró un evento sin slug.");
      }

      const result = await Event.updateOne(
        { slug: event.slug },
        {
          $setOnInsert: event,
        },
        {
          upsert: true,
          runValidators: true,
        }
      );

      if (result.upsertedCount > 0) {
        inserted++;
      } else {
        existing++;
      }
    }

    console.log("Seed completado.");
    console.log("Insertados:", inserted);
    console.log("Ya existentes:", existing);
    console.log("Total procesado:", events.length);
  } catch (error) {
    console.error("Error ejecutando el seed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedEvents();
