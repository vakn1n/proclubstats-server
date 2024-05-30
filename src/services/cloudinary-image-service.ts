import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { promisify } from "util";
import logger from "../config/logger";
import { extractPublicId } from "cloudinary-build-url";
import { injectable } from "tsyringe";
import { ImageService } from "../interfaces/util-services/image-service.interface";

const unlinkAsync = promisify(fs.unlink);

@injectable()
export class CloudinaryImageService implements ImageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
      secure: true,
    });
  }
  async removeImage(imgUrl: string): Promise<void> {
    logger.info(`deleting image from cloudinary: ${imgUrl}`);

    try {
      const publicId = extractPublicId(imgUrl);

      if (!publicId) {
        throw new Error(`Could not find public id in ${imgUrl}`);
      }

      // Use the public ID to delete the image
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result !== "ok") {
        throw new Error("Failed to delete image from Cloudinary");
      }
    } catch (error) {
      logger.error(error);
      throw new Error("Failed to delete image from Cloudinary");
    }
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
}
