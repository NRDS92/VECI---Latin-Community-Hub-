import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const uploadImage = async (filePath: string) => {
    const result = await cloudinary.uploader.upload(filePath, {
        folder: "veci",
    });
    

    return result.secure_url;
};