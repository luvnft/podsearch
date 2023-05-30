import path from "path";
import multer, { StorageEngine, Multer } from "multer";
import { Request, Response } from "express";

class ImagesService {
  public storage: StorageEngine;
  public upload: Multer;
  public static uploadsPath: string = path.join(__dirname, "..", "..", "..", "..", "uploads/");

  public constructor() {
    this.storage = this.initStorage();
    this.upload = multer({ storage: this.storage });
  }

  public initStorage(): StorageEngine {
    const storage: StorageEngine = multer.diskStorage({
      destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, ImagesService.uploadsPath);
      },
      filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, `${file.originalname}`);
      },
    });
    return storage;
  }

  public getFilePath(filename: string): string {
    const filePath = path.join(ImagesService.uploadsPath, filename);
    return filePath; 
  }

  public uploadImage = (req: Request, res: Response): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      this.upload.single("image")(req, res, (error: any) => {
        if (error) {
          reject(false);
        } else {
          resolve(true); 
        }
      });
    });
  }
}

export default ImagesService;
