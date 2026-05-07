import { api } from "../../../api/clients";

export const uploadEventImage = async (
    uri: string,
    token: string
    ) => {
    const formData = new FormData();

    formData.append("image", {
        uri,
        name: "event.jpg",
        type: "image/jpeg",
    } as any);

    const res = await fetch(
        "http://10.0.2.2:5000/api/v1/upload", 
        {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
        }
    );

    const data = await res.json();

    if (!data.success) {
        throw new Error(data.message);
    }

    return data.data;
};