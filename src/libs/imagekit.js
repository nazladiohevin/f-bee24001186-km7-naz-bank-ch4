import ImageKit from "imagekit";
import dotenv from "dotenv";

dotenv.config();

const {
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_SECRET_KEY,
  IMAGEKIT_URL_ENDPOINT
} = process.env;


const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_SECRET_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT
});

const uploadImage = async (req) => {
  const stringFile = req.file.buffer.toString("base64");  

  try {

    const uploadFile = await imagekit.upload({
      fileName: req.file.originalname,
      file: stringFile        
    });     

    return uploadFile;

  } catch (error) {
    throw new Error("Failed to upload to ImageKit");
  }
}

const deleteImage = async (imageId) => {
  try {
    await imagekit.deleteFile(imageId);      
  } catch (error) {
    throw new Error("Failed to delete image from ImageKit");
  }
}

export default {
  uploadImage,
  deleteImage
}