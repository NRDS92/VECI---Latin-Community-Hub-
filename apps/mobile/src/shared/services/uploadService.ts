export const uploadImage = async (uri: string, token: string) => {
  const upload = async () => {
    const formData = new FormData();

    formData.append("image", {
      uri,
      name: `upload-${Date.now()}.jpg`,
      type: "image/jpeg",
    } as any);

    const res = await fetch(
      "https://veci-api-pm1e.onrender.com/api/v1/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    const data = await res.json();
    return data.data;
  };

  // 🔥 retry automático
  try {
    return await upload();
  } catch (err) {
    console.log("Retrying upload...");
    await new Promise((r) => setTimeout(r, 2000)); // espera 2s
    return await upload();
  }
};