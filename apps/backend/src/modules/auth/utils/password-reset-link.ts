const SUPPORTED_LOCALES = ["en", "es", "de"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const getLandingBaseUrl = (): URL => {
  const configuredUrl = process.env.LANDING_BASE_URL;
  const isLocal = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
  const value = configuredUrl ?? (isLocal ? "http://localhost:3000" : undefined);

  if (!value) {
    throw new Error("LANDING_BASE_URL must be configured for password reset emails");
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("LANDING_BASE_URL must be a valid origin URL");
  }

  const localHost = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    (url.protocol !== "https:" && !(isLocal && localHost && url.protocol === "http:")) ||
    (isLocal && !localHost) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error("LANDING_BASE_URL must be a trusted HTTPS origin (HTTP is allowed for local development)");
  }

  return url;
};

const normalizeLocale = (locale?: string): SupportedLocale =>
  SUPPORTED_LOCALES.find((supported) => supported === locale) ?? "en";

export const buildPasswordResetUrl = (token: string, locale?: string): string => {
  const baseUrl = getLandingBaseUrl();
  const safeLocale = normalizeLocale(locale);
  return new URL(`/${safeLocale}/reset-password/${encodeURIComponent(token)}`, baseUrl).toString();
};

export const validatePasswordResetLandingUrl = (): void => {
  getLandingBaseUrl();
};
