import { api } from "../../../api/clients"; // your axios instance


export const getEventById = async (id: string) => {
    const res = await api.get(`/events/${id}`);
    return res.data.data; 
};