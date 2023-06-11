import { Request, Response } from "express";
import { SearchResponse } from "../types/SearchResponse";
import TranscriptionsService from "../services/TranscriptionsService";

class TranscriptionsController {
  public transcriptionService: TranscriptionsService;

  public constructor() {
    this.transcriptionService = new TranscriptionsService();
  }

  public search = async (req: Request, res: Response) => {
    try {
      const searchString: string = (req.query.searchString as string) || "";
      const data: SearchResponse = await this.transcriptionService.search(searchString);
      res.status(200).send(data);
    } catch (error: any) {
      res.status(400).send({ message: JSON.stringify(error) });
    }
  };

  public getTrending = async (req: Request, res: Response) => {
    try {
      const data: SearchResponse = await this.transcriptionService.getTrending();
      res.status(200).send(data);
    } catch (error: any) {
      res.status(400).send({ message: JSON.stringify(error) });
    }
  };

  public getSegment = async (req: Request, res: Response) => {
    try {
      const segmentId: string = (req.query.segmentId as string) || "";
      const data: SearchResponse = await this.transcriptionService.getSegment(segmentId);
      res.status(200).send(data);
    } catch (error: any) {
      res.status(400).send({ message: JSON.stringify(error) });
    }
  };

  public getNew = async (req: Request, res: Response) => {
    try {
      const data: SearchResponse = await this.transcriptionService.getNew();
      res.status(200).send(data);
    } catch (error: any) {
      res.status(400).send({ message: JSON.stringify(error) });
    }
  };
}

export default TranscriptionsController;
