import { api } from "../../../api/clients";

export const toggleFavorite = async (eventId: string) => {
  const res = await api.post(`/users/favorites/${eventId}`);
  return res.data.data;
};