import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localImagePath) => {
  try {
    if (!localImagePath) return null;

    //upload file on cloud
    const response = await cloudinary.uploader.upload(localImagePath, {
      folder: process.env.CLOUDINARY_PROJECT,
    });

    //file uploaded successfully, unlink it
    fs.unlinkSync(localImagePath);
    return response;
  } catch (err) {
    //removes locally saved temp files as the upload operation got failed
    fs.unlinkSync(localImagePath);
    return null;
  }
};

const deleteFromCloudinary = async (url) => {
  const public_id = url.split("/").pop().split(".")[0];
  return await cloudinary.uploader.destroy(
    `${process.env.CLOUDINARY_PROJECT}/${public_id}`
  );
};

export { uploadOnCloudinary, deleteFromCloudinary };
