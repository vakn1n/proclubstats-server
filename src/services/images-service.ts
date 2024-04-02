import { v2 as cloudinary } from "cloudinary";
import logger from "../logger";

export default class ImageService {
  private static instance: ImageService;

  static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  private constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: "your_cloud_name",
      api_key: "your_api_key",
      api_secret: "your_api_secret",
    });
  }

  async uploadImage(file: Express.Multer.File) {
    logger.info(`uploading image file ${file.filename} to cloudinary`);
    try {
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(file.path);
      return result.secure_url;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to upload image");
    }
  }

  // Add more image-related methods here, such as deleting images, updating image URLs, etc.
}
