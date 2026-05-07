import { api } from "../../../api/clients";

export const createBusiness = async (data: any) => {
    const res = await api.post("/business", data);
    return res.data.data;
};

export const getMyBusinesses = async () => {
    const res = await api.get("/business/me");
    return res.data.data;
};

export const deleteBusiness = async (id: string) => {
    const res = await api.delete(`/business/${id}`);
    return res.data;
};
export const getBusinessById = async (id: string) => {
    const res = await api.get(`/business/${id}`);
    return res.data.data;
};

export const updateBusiness = async ({
    id,
    data,
}: {
    id: string;
    data: any;
}) => {
    const res = await api.put(`/business/${id}`, data);
    return res.data.data;
};