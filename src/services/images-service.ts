import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { promisify } from "util";
import logger from "../logger";

const unlinkAsync = promisify(fs.unlink);

export default class ImageService {
  private static instance: ImageService;

  static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  private constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
      secure: true,
    });
  }

  async uploadImage(file: Express.Multer.File) {
    logger.info(`uploading image file ${file.filename} to cloudinary`);
    try {
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(file.path);

      return result.secure_url;
    } catch (error) {
      logger.error(error);
      throw new Error("Failed to upload image");
    } finally {
      // Delete the local file
      await unlinkAsync(file.path);
    }
  }

  // Add more image-related methods here, such as deleting images, updating image URLs, etc.
}
