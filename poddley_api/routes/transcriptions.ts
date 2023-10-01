import express from "express";
import TranscriptionsController from "../controllers/TranscriptionsController";

//Router
const transcriptionsRouter: express.Router = express.Router();

//Initialize controller
const transcriptionsController: TranscriptionsController = new TranscriptionsController();

//Routes
transcriptionsRouter.post("/search", transcriptionsController.search);

//Export it
export default transcriptionsRouter;
