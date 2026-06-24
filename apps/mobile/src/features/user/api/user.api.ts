import { api } from "../../../api/clients"

export const updateUser = async (data: {
        name?: string;
        cityId?: string;
        bio?: string;
        profileImage?: string;
        onboardingCompleted?: boolean;
    }) => {
    const res = await api.post("/users/me", data);

    return res.data.data;
};

export const uploadProfileImageApi = async (formData: FormData) => {
    const res = await api.post(
        "/users/upload-profile-image",
        formData,
        {
        headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return res.data.data; // URL
};

export const getMe = async () => {
    const res = await api.get("/users/me");
    return res.data.data;
};

export const getFavoriteEvents = async () => {
  const res = await api.get("/users/favorites");
  return res.data.data;
};

export const deleteAccount = async () => {
  const res = await api.delete("/auth/me");
  return res.data;
};