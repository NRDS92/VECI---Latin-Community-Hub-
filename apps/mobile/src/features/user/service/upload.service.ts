import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../../../src/api/clients";

export const uploadProfileImage = async (
    uri: string,
    token: string
    ) => {
    const formData = new FormData();

    formData.append("image", {
        uri,
        name: "profile.jpg",
        type: "image/jpeg",
    } as any);

    const res = await fetch(
        "http://10.0.2.2:5000/api/v1/users/upload-profile-image",
        {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`, // 🔥 ahora viene del context
        },
        body: formData,
        }
    );

    const data = await res.json();

    console.log("UPLOAD RESPONSE:", data);

    if (!data.success) {
        throw new Error(data.message || "Upload failed");
    }

    return data.data;
};

export const getMyBusinesses = async () => {
  const res = await api.get("/business/me");
  return res.data.data;
};