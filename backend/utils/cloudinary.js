import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (
    localFilePath,
    folder = "event-mgmt",
) => {
    if (!localFilePath) return null;
    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder,
        });
        await fs.unlink(localFilePath).catch(() => {});
        return response;
    } catch (err) {
        await fs.unlink(localFilePath).catch(() => {});
        console.error("Cloudinary upload failed:", err.message);
        return null;
    }
};

export const deleteFromCloudinary = async (
    publicId,
    resourceType = "image",
) => {
    if (!publicId) return null;
    try {
        return await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
    } catch (err) {
        console.error("Cloudinary delete failed:", err.message);
        return null;
    }
};

export { cloudinary };
