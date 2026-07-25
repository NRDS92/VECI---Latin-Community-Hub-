import AsyncStorage from "@react-native-async-storage/async-storage";

export const uploadEventImage = async (uri: string) => {
    const formData = new FormData();

    formData.append("image", {
        uri,
        name: "event.jpg",
        type: "image/jpeg",
    } as any);

    const token = await AsyncStorage.getItem("token");

    const response = await fetch(
        "https://veci-api-pm1e.onrender.com/api/v1/upload",
        {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
        }
    );

    console.log("STATUS:", response.status);

    const json = await response.json();

    console.log("BODY:", json);

    return json.data;
};