import { api } from "../../../api/clients";

export const createEvent = async (data: any) => {
  const res = await api.post("/events", data);
  console.log(res.data.data)
  return res.data.data;
};

export const getMyEvents = async () => {
    try {
        const res = await api.get("/events/me");

        return res.data.data;
    } catch (error: any) {
        console.log("API ERROR:", error?.response?.data || error.message);
        throw error;
    }
};

export const updateEvent = async (id: string, data: any) => {
    const res = await api.patch(`/events/${id}`, data);
    return res.data.data;
};

export const deleteEvent = async (id: string) => {
    console.log("DELETING EVENT:", id);

    const res = await api.delete(`/events/${id}`);

    console.log("DELETE RESPONSE:", res.data);

    return res.data;
};