import { ImageService } from "../../../interfaces/util-services/image-service.interface";

export class MockImageService implements ImageService {
  uploadImage = jest.fn<Promise<string>, [Express.Multer.File]>();
  removeImage = jest.fn<Promise<void>, [string]>();
}
