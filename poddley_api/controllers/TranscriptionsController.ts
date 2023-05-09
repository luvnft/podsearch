import { Request, Response } from "express";
import TranscriptionsService from "../services/TranscriptionsService";
import { SearchResponse } from "../types/SearchResponse";
class TranscriptionsController {
  public async search(req: Request, res: Response) {
    try {
      const searchString: string = (req.query.searchString as string) || "";
      const data: SearchResponse = await TranscriptionsService.search(searchString);
      console.log("SearchString: ", searchString)
      res.status(200).send(data);
    } catch (error: any) {
      res.status(400).send({ message: error });
    }
  }
}

export default new TranscriptionsController();
