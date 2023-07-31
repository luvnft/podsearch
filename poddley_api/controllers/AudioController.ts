import { Request, RequestHandler, Response } from "express";
import AudioService from "../services/AudioService";

class AudioController {
  public audioService: AudioService;

  public constructor() {
    this.audioService = new AudioService();
  }

  public uploadAudioStream = async (req: Request, res: Response) => {
    try {
      await this.audioService.processAudioStream(req);
      res.status(200).send({ message: "Stream received and saved successfully" });
    } catch (error: any) {
      res.status(400).send({ message: JSON.stringify(error) });
    }
  };

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
