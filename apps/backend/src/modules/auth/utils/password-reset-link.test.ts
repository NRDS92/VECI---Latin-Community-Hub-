import { buildPasswordResetUrl } from "./password-reset-link";

const previousNodeEnv = process.env.NODE_ENV;
const previousLandingUrl = process.env.LANDING_BASE_URL;

afterEach(() => {
  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;
  if (previousLandingUrl === undefined) delete process.env.LANDING_BASE_URL;
  else process.env.LANDING_BASE_URL = previousLandingUrl;
});

describe("password reset link configuration", () => {
  it("defaults local development to localhost and encodes the token as one path segment", () => {
    process.env.NODE_ENV = "development";
    delete process.env.LANDING_BASE_URL;
    expect(buildPasswordResetUrl("token/with?reserved&chars", "fr"))
      .toBe("http://localhost:3000/en/reset-password/token%2Fwith%3Freserved%26chars");
  });

  it("uses an explicitly configured staging or production origin", () => {
    process.env.NODE_ENV = "production";
    process.env.LANDING_BASE_URL = "https://landing-staging.example.test";
    expect(buildPasswordResetUrl("abc", "de"))
      .toBe("https://landing-staging.example.test/de/reset-password/abc");

    process.env.LANDING_BASE_URL = "https://www.veci-latin.com";
    expect(buildPasswordResetUrl("abc", "es"))
      .toBe("https://www.veci-latin.com/es/reset-password/abc");
  });

  it("rejects missing production configuration and unsafe or path-bearing origins", () => {
    process.env.NODE_ENV = "production";
    delete process.env.LANDING_BASE_URL;
    expect(() => buildPasswordResetUrl("abc")).toThrow("LANDING_BASE_URL must be configured");

    process.env.LANDING_BASE_URL = "https://landing.example.test/redirect?to=https://attacker.test";
    expect(() => buildPasswordResetUrl("abc")).toThrow("trusted HTTPS origin");

    process.env.LANDING_BASE_URL = "http://attacker.example.test";
    expect(() => buildPasswordResetUrl("abc")).toThrow("trusted HTTPS origin");
  });
});
