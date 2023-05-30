import express from "express";
import TranscriptionsController from "../controllers/TranscriptionsController"

//Initialize controller
const transcriptionsController: TranscriptionsController = new TranscriptionsController();

//Router
const transcriptionsRouter: express.Router = express.Router();

//Get Routes
transcriptionsRouter.get("/transcriptions", transcriptionsController.search);
transcriptionsRouter.get("/trendingQuotes", transcriptionsController.getTop10Segments);

//Export it
export default transcriptionsRouter;