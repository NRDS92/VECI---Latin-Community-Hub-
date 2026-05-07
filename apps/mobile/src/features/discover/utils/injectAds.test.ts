import { injectAds } from "./injectAds";

describe("injectAds", () => {
    it("should insert an ad every 3 events", () => {
        const events = [
            { _id: "1" },
            { _id: "2" },
            { _id: "3" },
            { _id: "4" },
        ] as any;

        const result = injectAds(events);

        // debe crecer
        expect(result.length).toBeGreaterThan(events.length);

        // debe tener ads
        const ads = result.filter((item) => item.isAd);
        expect(ads.length).toBeGreaterThan(0);
    });
});