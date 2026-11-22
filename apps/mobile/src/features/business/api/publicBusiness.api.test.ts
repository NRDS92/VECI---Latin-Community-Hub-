import axios from "axios";
import { router } from "expo-router";
import { createElement, type ReactElement, type ReactNode } from "react";
import type { PublicBusiness } from "@ndrs92/contracts";
import { api } from "../../../api/clients";
import BusinessCard from "../components/BusinnessCard";
import DiscoverList from "../../discover/components/DiscoverList";
import { fetchDiscover } from "../../discover/services/discover.service";
import { getFeedItemKey, type FeedItem } from "../../discover/types/discover.types";
import { getPublicBusinessBySlug } from "./publicBusiness.api";

jest.mock("axios", () => ({ create: jest.fn(() => ({ get: jest.fn() })) }));
jest.mock("../../../api/clients", () => ({ api: { get: jest.fn() } }));
jest.mock("../../../config/env", () => ({ API_V1_URL: "https://example.test/api/v1" }));
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("../../discover/components/AdCard", () => () => null);
jest.mock("../../events/components/EventCard", () => () => "Event card");
jest.mock("react-native", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  return {
    StyleSheet: { create: (styles: unknown) => styles },
    View: ({ children }: { children: ReactNode }) => createElement("div", null, children),
    Text: ({ children }: { children: ReactNode }) => createElement("span", null, children),
    Image: () => null,
    Pressable: (props: { children: ReactNode; disabled: boolean; onPress: () => void }) => {
      mockPressable(props);
      return createElement("button", { disabled: props.disabled }, props.children);
    },
    FlatList: ({ data, keyExtractor, renderItem }: {
      data: FeedItem[];
      keyExtractor: (item: FeedItem) => string;
      renderItem: ({ item }: { item: FeedItem }) => ReactElement;
    }) => createElement("div", null, data.map(item =>
      createElement("section", { key: keyExtractor(item) }, renderItem({ item }))
    )),
  };
});

const { renderToStaticMarkup } = jest.requireActual<{ renderToStaticMarkup: (element: ReactElement) => string }>(
  "react-dom/server"
);
const mockPressable = jest.fn<void, [{ disabled: boolean; onPress: () => void }]>();

const business: PublicBusiness = {
  id: "business-123",
  slug: "published-cafe",
  name: "Café",
  providerType: "business",
  category: "food",
  cityId: "cologne",
  image: "https://example.test/profile.jpg",
  coverImage: "https://example.test/cover.jpg",
  gallery: [],
  documents: [],
  contact: {},
  community: { isLatinoOwned: true },
  profile: { services: [], specialties: [], languages: [], serviceArea: [] },
  tags: [],
  languages: [],
  isLatinoOwned: true,
  rating: { average: 0, count: 0 },
  likesCount: 0,
  followersCount: 0,
  eventsCount: 0,
  verification: {
    status: "unverified",
    checks: { identity: false, contact: false, activity: false },
  },
  verificationStatus: "unverified",
  isFeatured: false,
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const publicGet = jest.mocked(axios.create).mock.results[0].value.get as jest.Mock;
const discoveryGet = jest.mocked(api.get);
const event: FeedItem = {
  type: "event",
  _id: "event-123",
  title: "Event",
  category: "music",
  cityId: "cologne",
  dateStart: "2026-01-01T00:00:00.000Z",
  eventType: "official",
  location: { type: "Point", coordinates: [7, 50] },
};

beforeEach(() => {
  publicGet.mockReset();
  discoveryGet.mockReset();
  mockPressable.mockClear();
  jest.mocked(router.push).mockClear();
});

function respondWithPublication(entityType: string, entity: unknown = business) {
  publicGet.mockResolvedValue({ data: { success: true, data: { publication: { entityType }, entity } } });
}

describe("public Business detail", () => {
  it("requests the supplied Publication slug using the anonymous client", async () => {
    respondWithPublication("BUSINESS");

    await expect(getPublicBusinessBySlug(business.slug)).resolves.toEqual(business);
    expect(axios.create).toHaveBeenCalledWith({ baseURL: "https://example.test/api/v1", timeout: 15000 });
    expect(publicGet).toHaveBeenCalledWith("/public/content/published-cafe");
    expect(discoveryGet).not.toHaveBeenCalled();
  });

  it("rejects an Event publication", async () => {
    respondWithPublication("EVENT");
    await expect(getPublicBusinessBySlug(business.slug)).rejects.toThrow("Expected a public business publication");
  });

  it("rejects private fields in the public entity", async () => {
    respondWithPublication("BUSINESS", { ...business, owner: "private" });
    await expect(getPublicBusinessBySlug(business.slug)).rejects.toThrow();
  });

  it("propagates a missing publication without falling back to the private API", async () => {
    const error = { response: { status: 404 } };
    publicGet.mockRejectedValue(error);

    await expect(getPublicBusinessBySlug(business.slug)).rejects.toBe(error);
    expect(publicGet).toHaveBeenCalledTimes(1);
    expect(discoveryGet).not.toHaveBeenCalled();
  });
});

describe("Business entries in Discovery", () => {
  it("retains distinct contract ids and preserves the published slugs and images", async () => {
    const first = { ...business, type: "business" };
    const second = { ...first, id: "business-456" };
    discoveryGet.mockResolvedValue({
      data: { success: true, data: { recommended: [first, second], page: 1, hasMore: true } },
    });

    const result = await fetchDiscover({ type: "business" });

    expect(result.data).toEqual({ recommended: [first, second], page: 1, hasMore: true });
    expect(result.data.recommended.map(getFeedItemKey)).toEqual([
      "business-business-123",
      "business-business-456",
    ]);
  });

  it("opens the canonical public route from a mixed feed and keeps its Event", async () => {
    // The Business record slug would be "cafe". The feed sends Publication.slug.
    const publishedBusiness = { ...business, type: "business" };
    discoveryGet.mockResolvedValue({
      data: { success: true, data: { recommended: [event, publishedBusiness], page: 1, hasMore: false } },
    });

    const { data } = await fetchDiscover({ type: "all" });
    expect(discoveryGet).toHaveBeenCalledWith("/discover", expect.objectContaining({
      baseURL: "https://example.test/api/v1",
    }));
    expect(data.recommended.map(getFeedItemKey)).toEqual(["event-event-123", "business-business-123"]);
    const markup = renderToStaticMarkup(createElement(DiscoverList, {
      items: data.recommended,
      handleToggle: jest.fn(),
      isFavorite: () => false,
      favorites: [],
      fetchNextPage: jest.fn(),
      loadingMore: false,
      refreshing: false,
      refetch: jest.fn(),
    }));
    expect(markup).toContain("Event card");
    expect(markup).toContain("Café");

    const [pressable] = mockPressable.mock.calls[0];
    expect(pressable.disabled).toBe(false);
    pressable.onPress();
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/business/public/[slug]",
      params: { slug: "published-cafe" },
    });
  });

  it("drops a Business with an absent slug without dropping the Event", async () => {
    const { slug: _slug, ...withoutSlug } = business;
    discoveryGet.mockResolvedValue({
      data: { success: true, data: { recommended: [event, { ...withoutSlug, type: "business" }], page: 1, hasMore: false } },
    });

    const { data } = await fetchDiscover({ type: "all" });
    expect(data.recommended).toEqual([event]);
  });

  it.each(["", "   "])("disables the Business card when the slug is %j", slug => {
    renderToStaticMarkup(createElement(BusinessCard, { item: { ...business, slug } }));
    const [pressable] = mockPressable.mock.calls[0];
    expect(pressable.disabled).toBe(true);
    pressable.onPress();
    expect(router.push).not.toHaveBeenCalled();
  });
});
