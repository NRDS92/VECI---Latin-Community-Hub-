import type { AxiosAdapter } from "axios";
import { OwnerBusinessSchema } from "@ndrs92/contracts";

const ownerBusiness = OwnerBusinessSchema.parse({
  _id: "business-123", slug: "business-123", name: "Business", providerType: "business", category: "food",
  profile: { services: [], specialties: [], languages: [], serviceArea: [] },
  images: { profile: "profile.jpg", gallery: [] }, documents: [], location: { cityId: "cologne" }, contact: {},
  community: { isLatinoOwned: true }, tags: [], languages: [], isLatinoOwned: true,
  rating: { average: 0, count: 0 }, likesCount: 0, followersCount: 0, eventsCount: 0,
  verification: { status: "unverified", checks: { identity: false, contact: false, activity: false } },
  isFeatured: false, status: "active", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
});

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue("test-session"),
}));

afterEach(() => jest.restoreAllMocks());

describe("authenticated Business client", () => {
  it.each([
    ["http://192.168.178.77:5000", "http://192.168.178.77:5000"],
    ["http://192.168.178.77:5000///", "http://192.168.178.77:5000"],
    ["http://192.168.178.77:5000/api/v1", "http://192.168.178.77:5000"],
    ["http://192.168.178.77:5000/api/v1///", "http://192.168.178.77:5000"],
    ["https://veci-api-pm1e.onrender.com", "https://veci-api-pm1e.onrender.com"],
    ["https://veci-api-pm1e.onrender.com/api/v1/", "https://veci-api-pm1e.onrender.com"],
    [undefined, "https://veci-api-pm1e.onrender.com"],
  ])("resolves owner URLs for EXPO_PUBLIC_API_URL=%s", async (configuredUrl, host) => {
    jest.replaceProperty(process, "env", {
      ...process.env,
      EXPO_PUBLIC_API_URL: configuredUrl,
    });

    await jest.isolateModulesAsync(async () => {
      const { api } = jest.requireActual<typeof import("./clients")>("./clients");
      const { getMyBusinesses, getBusinessById } = jest.requireActual<
        typeof import("../features/business/api/business.api")
      >("../features/business/api/business.api");
      const urls: string[] = [];
      const adapter: AxiosAdapter = async (config) => {
        urls.push(api.getUri(config));
        expect(config.headers.has("Authorization")).toBe(true);
        return {
          config,
          data: { success: true, data: config.url?.endsWith("/me") ? [ownerBusiness] : ownerBusiness },
          headers: {},
          status: 200,
          statusText: "OK",
        };
      };
      api.defaults.adapter = adapter;

      await getMyBusinesses();
      await getBusinessById("business-123");

      expect(urls).toEqual([
        `${host}/api/v1/business/me`,
        `${host}/api/v1/business/business-123`,
      ]);
    });
  });
});
