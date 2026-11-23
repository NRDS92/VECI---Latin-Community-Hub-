import { api } from "../../../api/clients";
import { createEvent, getAvailableEventOrganizers } from "./events.api";

jest.mock("../../../api/clients", () => ({
  api: { post: jest.fn(), get: jest.fn() },
}));

describe("event API contracts", () => {
  beforeEach(() => jest.clearAllMocks());

  it("validates and sends a Community-organized event", async () => {
    const dateStart = "2030-05-01T18:00:00.000Z";
    (api.post as jest.Mock).mockResolvedValue({ data: { data: { id: "event-1" } } });

    await createEvent({
      title: "Community dinner", eventType: "community", category: "food", cityId: "berlin",
      images: ["https://cdn.example.test/event.jpg"], address: "Main Street 1", latitude: 52.52,
      longitude: 13.405, dateStart, organizer: { type: "community", id: "community-1" },
    });

    expect(api.post).toHaveBeenCalledWith("/events", expect.objectContaining({
      organizer: { type: "community", id: "community-1" },
      eventType: "community",
      dateStart: new Date(dateStart),
    }));
  });

  it("rejects event payloads without an organizer before making a request", async () => {
    await expect(createEvent({
      title: "No organizer", eventType: "community", category: "food", cityId: "berlin",
      images: [], address: "Main Street 1", latitude: 52.52, longitude: 13.405,
      dateStart: "2030-05-01T18:00:00.000Z",
    } as never)).rejects.toThrow();

    expect(api.post).not.toHaveBeenCalled();
  });

  it("loads only the server-provided eligible event organizers", async () => {
    const organizers = [{ type: "community", id: "community-1", name: "Berlin Latinos", slug: "berlin-latinos" }];
    (api.get as jest.Mock).mockResolvedValue({ data: { data: organizers } });

    await expect(getAvailableEventOrganizers()).resolves.toEqual(organizers);
    expect(api.get).toHaveBeenCalledWith("/events/organizers");
  });
});
