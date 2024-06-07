import { ImageService } from "../../../interfaces/util-services/image-service.interface";

export class MockImageService implements ImageService {
  uploadImage(file: Express.Multer.File): Promise<string> {
    throw new Error("Method not implemented.");
  }
  removeImage(imgUrl: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
