import { api } from "../../../api/clients";
import {
    CreateBusinessRequestSchema,
    OwnerBusinessResponseSchema,
    OwnerBusinessesResponseSchema,
    UpdateBusinessRequestSchema,
    type CreateBusinessRequest,
    type OwnerBusiness,
    type UpdateBusinessRequest,
} from "@ndrs92/contracts";

export const createBusiness = async (data: CreateBusinessRequest): Promise<OwnerBusiness> => {
    const payload = CreateBusinessRequestSchema.parse(data);
    const res = await api.post("/business", payload);
    return OwnerBusinessResponseSchema.parse(res.data).data;
};

export const getMyBusinesses = async (): Promise<OwnerBusiness[]> => {
    const res = await api.get("/business/me");
    return OwnerBusinessesResponseSchema.parse(res.data).data;
};

export const deleteBusiness = async (id: string) => {
    const res = await api.delete(`/business/${id}`);
    return res.data;
};
export const getBusinessById = async (id: string): Promise<OwnerBusiness> => {
    const res = await api.get(`/business/${id}`);
    return OwnerBusinessResponseSchema.parse(res.data).data;
};

export const updateBusiness = async ({
    id,
    data,
}: {
    id: string;
    data: UpdateBusinessRequest;
}): Promise<OwnerBusiness> => {
    const payload = UpdateBusinessRequestSchema.parse(data);
    const res = await api.put(`/business/${id}`, payload);
    return OwnerBusinessResponseSchema.parse(res.data).data;
};
