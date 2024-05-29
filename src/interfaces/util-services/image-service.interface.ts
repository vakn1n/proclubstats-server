export interface ImageService {
  uploadImage(file: Express.Multer.File): Promise<string>;
  removeImage(imgUrl: string): Promise<void>;
}
