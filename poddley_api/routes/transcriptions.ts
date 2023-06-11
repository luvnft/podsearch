import express from "express";
import TranscriptionsController from "../controllers/TranscriptionsController"

//Initialize controller
const transcriptionsController: TranscriptionsController = new TranscriptionsController();

//Router
const transcriptionsRouter: express.Router = express.Router();

//Get Routes
transcriptionsRouter.get("/new", transcriptionsController.getNew);
transcriptionsRouter.get("/trending", transcriptionsController.getTrending);
transcriptionsRouter.get("/segment", transcriptionsController.getSegment);

//Export it
export default transcriptionsRouter;