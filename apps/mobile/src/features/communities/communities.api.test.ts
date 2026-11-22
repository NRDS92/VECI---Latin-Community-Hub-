import { api } from "../../api/clients";
import { getPublicCommunityEvents } from "./communities.api";

jest.mock("../../api/clients", () => ({ api: { get: jest.fn() } }));

describe("Community Event API", () => {
  it("parses organizer-scoped public Events using the shared DTO", async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: [{
      id: "event-1", slug: "community-dinner", title: "Community dinner", category: "food",
      eventType: "community", cityId: "berlin", address: "Town Hall", dateStart: "2027-06-01T18:00:00.000Z",
      images: [], links: [], goodToKnow: [],
      organizer: { type: "community", id: "community-1", slug: "berlin-latinos", name: "Berlin Latinos" },
    }] } });

    await expect(getPublicCommunityEvents("community-1")).resolves.toMatchObject([{ id: "event-1", organizer: { id: "community-1" } }]);
    expect(api.get).toHaveBeenCalledWith("/public/communities/community-1/events");
  });

  it("rejects invalid public event payloads", async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: [{ id: "event-1" }] } });
    await expect(getPublicCommunityEvents("community-1")).rejects.toThrow();
  });
});
