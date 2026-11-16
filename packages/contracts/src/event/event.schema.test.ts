
import { describe, expect, it } from "vitest";
import { PublicEventSchema } from "./event.schema.js";

const validEvent = {
        id: "event-123",
        slug: "latin-party",
        title: "Latin Party",
        category: "party",
        eventType: "community",
        cityId: "cologne",
        address: "Cologne, Germany",
        dateStart: "2026-12-20T19:00:00.000Z",
        images: [],
        links: [],
        goodToKnow: [],
    };
    describe("PublicEventSchema", () => {
    it("accepts a valid public event", () => {
        expect(PublicEventSchema.safeParse(validEvent).success).toBe(true);
    });
    it("rejects an invalid event type", () => {
        const result = PublicEventSchema.safeParse({
        ...validEvent,
        eventType: "private",
        });
        expect(result.success).toBe(false);
    });
    it("rejects an invalid date", () => {
        const result = PublicEventSchema.safeParse({
            ...validEvent,
            dateStart: "not-a-date",
            });
        expect(result.success).toBe(false);
    });
    it("rejects internal fields", () => {
        const result = PublicEventSchema.safeParse({
        ...validEvent,
        publicId: "internal-cloudinary-id",
        });
        expect(result.success).toBe(false);
    });
    it("accepts an event with all public optional fields", () => {
        const event = {
            ...validEvent,
            description: "A Latin community event",
            dateEnd: "2026-12-21T02:00:00.000Z",
            location: {
            type: "Point",
            coordinates: [-6.9603, 50.9375],
            },
            price: {
            type: "paid",
            amount: 15,
            currency: "EUR",
            },
            attachment: {
            url: "https://example.com/document.pdf",
            name: "Program.pdf",
            size: 2048,
            },
        };

        expect(PublicEventSchema.safeParse(event).success).toBe(true);
    });

    it("accepts an event without optional fields", () => {
        const serialized = JSON.parse(
            JSON.stringify(validEvent)
        );

        expect(PublicEventSchema.safeParse(serialized).success).toBe(true);
    });
});
