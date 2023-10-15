import { Request, RequestHandler, Response } from "express";
import AudioService from "../services/AudioService";

class AudioController {
  public audioService: AudioService;

  public constructor() {
    this.audioService = new AudioService();
  }

  public uploadAudio = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).send({ message: "No file was uploaded" });
      }
      const data = await this.audioService.processAudioFile(req.file);
      res.status(200).send({ message: data });
    } catch (error: any) {
      res.status(400).send({ message: JSON.stringify(error) });
    }
  };
}

export default AudioController;
