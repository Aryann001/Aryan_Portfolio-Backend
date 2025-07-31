import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import ErrorHandler from "./ErrorHandler.js";

const upload = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return new ErrorHandler(
        "Could not file the local path for uploading on cloudinary",
        400
      );
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "Aryan Portfolio 2.0",
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);
    return {
      public_id: response.public_id,
      url: response.secure_url,
    };
  } catch (error) {
    console.log("File upload on cloudinary error : ", error.message);
    fs.unlinkSync(localFilePath);
    return new ErrorHandler(
      `File upload on cloudinary error : ${error.message}`,
      400
    );
  }
};

const deleteUploadedFile = async (public_id) => {
  try {
    const response = await cloudinary.uploader.destroy(public_id);

    return response;
  } catch (error) {
    console.log("File upload on cloudinary error : ", error.message);
    return new ErrorHandler(
      `File upload on cloudinary error : ${error.message}`,
      400
    );
  }
};

export { upload, deleteUploadedFile };
