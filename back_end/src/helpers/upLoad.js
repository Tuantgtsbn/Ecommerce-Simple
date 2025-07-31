const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const dotenv = require("dotenv");
const envPath = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({path: envPath});
console.log("environment", process.env.NODE_ENV);
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

const storage = multer.memoryStorage();
const upload = multer({storage});
const deleteImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    console.log("Deleted images:", result);
  } catch (error) {
    console.error("Error deleting images:", error);
    throw new Error("Error deleting images");
  }
};
const uploadOneImage = async (file, folder) => {
  try {
    let fileToUpload;

    // Nếu file là từ multer (có buffer)
    if (file.buffer) {
      fileToUpload = file.buffer;
    }
    // Nếu file là base64 hoặc URL
    else if (typeof file === "string") {
      fileToUpload = file;
    }
    // Nếu file là buffer trực tiếp
    else if (Buffer.isBuffer(file)) {
      fileToUpload = file;
    } else {
      throw new Error("Invalid file format");
    }

    const result = await cloudinary.uploader.upload(fileToUpload, {
      upload_preset: "e-commerce",
      folder: folder,
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Error uploading image");
  }
};
const deleteOneImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted image:", result);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error("Error deleting image");
  }
};
const uploadImagesProduct = async (files) => {
  const uploadedPublicIds = [];
  try {
    const thumnailUpload = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          upload_preset: "e-commerce",
          folder: "Ecommerce/thumbnails",
        },
        (error, result) => {
          if (error) return reject(error);
          uploadedPublicIds.push(result.public_id);
          resolve(result.secure_url);
        },
      );
      uploadStream.end(files.thumbnail[0].buffer);
    });
    const imagesUpload = await Promise.all(
      files.images.map((file) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              upload_preset: "e-commerce",
              folder: "Ecommerce/product-images",
            },
            (error, result) => {
              if (error) return reject(error);
              uploadedPublicIds.push(result.public_id);
              resolve(result.secure_url);
            },
          );
          uploadStream.end(file.buffer);
        });
      }),
    );
    return {thumbnail: thumnailUpload, images: imagesUpload};
  } catch (error) {
    console.error("Error uploading images:", error);
    await deleteImages(uploadedPublicIds);
    throw new Error("Error uploading images");
  }
};
const uploadManyImages = async (files, folder) => {
  const uploadedUrls = [];
  const uploadedPublicIds = [];

  try {
    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            upload_preset: "e-commerce",
            folder: folder,
          },
          (error, result) => {
            if (error) return reject(error);
            uploadedPublicIds.push(result.public_id);
            resolve(result.secure_url);
          },
        );
        uploadStream.end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);
    uploadedUrls.push(...results);

    return {
      urls: uploadedUrls,
      publicIds: uploadedPublicIds,
    };
  } catch (error) {
    console.error("Error uploading images:", error);
    // Nếu có lỗi, xóa các ảnh đã upload
    if (uploadedPublicIds.length > 0) {
      await deleteImages(uploadedPublicIds);
    }
    throw new Error("Error uploading images");
  }
};
module.exports = {
  upload,
  cloudinary,
  deleteImages,
  uploadImagesProduct,
  uploadOneImage,
  deleteOneImage,
  uploadManyImages,
};
