import type { AxiosAdapter } from "axios";

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
          data: { success: true, data: [] },
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
