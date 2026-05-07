import { api } from "../../../api/clients";

export const trackEventView = async (eventId: string) => {
  return api.post(`/events/${eventId}/view`);
};

export const attendEvent = async (eventId: string) => {

  const res = await api.post(`/events/${eventId}/attend`);

  return res.data;
};