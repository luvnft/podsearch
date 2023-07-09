import { Request, Response } from "express";
import ImagesService from "../services/ImagesService";

class ImagesController {
  public imagesService: ImagesService;

  public constructor() {
    this.imagesService = new ImagesService();
  }

  public getImage = (req: Request, res: Response): void => {
    try {
      const filename: string = req.params.filename;
      const filepath: string = this.imagesService.getFilePath(filename);
      res.sendFile(filepath, (err: any) => {
        if (err) { 
          res.status(404).send("Image not found");
        }
      });
    } catch (error: any) {
      res.status(500).send({ message: error });
    }
  };

  public uploadImage = async (req: Request, res: Response): Promise<void> => {
    const response = await this.imagesService.uploadImage(req, res);
    if (response) {
      res.status(200).json(response);
    } else {
      res.status(404).send(response);
    }
  };
}

export default ImagesController;
