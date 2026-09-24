import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (filePath: string) => {
    const result = await cloudinary.uploader.upload(filePath, {
        folder: "veci/events",
        resource_type: "image",
    });

    return result.secure_url;
};

export const uploadPdf = async (filePath: string) => {
    const result = await cloudinary.uploader.upload(filePath, {
        folder: "veci/events/attachments",
        resource_type: "raw",
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
    };
};

export const deletePdf = async (publicId: string) => {
    await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw",
        type: "upload",
        invalidate: true,
    });
};