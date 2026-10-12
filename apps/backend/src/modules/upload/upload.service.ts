
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Existing event/business image upload.
// Keep returning a URL to preserve compatibility.
export const uploadImage = async (filePath: string) => {
    const result = await cloudinary.uploader.upload(filePath, {
        folder: "veci/events",
        resource_type: "image",
    });

    return result.secure_url;
};

// New user profile image upload.
export const uploadUserProfileImage = async (filePath: string) => {
    const result = await cloudinary.uploader.upload(filePath, {
        folder: "veci/users/profiles",
        resource_type: "image",
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
    };
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

// Delete an image using its Cloudinary public ID.
export const deleteImage = async (publicId: string) => {
    if (!publicId) return;

    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        type: "upload",
        invalidate: true,
    });

    if (result.result !== "ok" && result.result !== "not found") {
        throw new Error("Could not delete image from Cloudinary");
    }
};
