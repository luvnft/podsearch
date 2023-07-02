import { Request, Response } from "express";
import { SearchResponse } from "../types/SearchResponse";
import TranscriptionsService from "../services/TranscriptionsService";
import { SearchQuery } from "../types/SearchQuery";

class TranscriptionsController {
  public transcriptionService: TranscriptionsService;

  public constructor() {
    this.transcriptionService = new TranscriptionsService();
  }

  public search = async (req: Request, res: Response) => {
    try {
      const searchQuery: SearchQuery = req.query.searchQuery as unknown as SearchQuery;
      const data: SearchResponse = await this.transcriptionService.search(searchQuery);
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
