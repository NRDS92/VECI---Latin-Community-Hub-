import { calculateScore } from "./calculateScore";

describe("calculateScore", () => {
    const baseEvent = {
        verificationStatus: "verified",
        eventType: "official",
        dateStart: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // mañana
        category: "party",
        location: {
        coordinates: [6.96, 50.93],
        },
    };

    it("should give higher score to nearby events", () => {
        const close = calculateScore(baseEvent, 50.93, 6.96, []);
        const far = calculateScore(baseEvent, 40, 2, []);

        expect(close).toBeGreaterThan(far);
    });

    it("should boost favorite categories", () => {
        const noFav = calculateScore(baseEvent, 50.93, 6.96, []);
        const fav = calculateScore(baseEvent, 50.93, 6.96, ["party"]);

        expect(fav).toBeGreaterThan(noFav);
    });

    it("should reward upcoming events", () => {
        const soonEvent = {
        ...baseEvent,
        dateStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const laterEvent = {
        ...baseEvent,
        dateStart: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const soon = calculateScore(soonEvent, 50.93, 6.96, []);
        const later = calculateScore(laterEvent, 50.93, 6.96, []);

        expect(soon).toBeGreaterThan(later);
    });
});