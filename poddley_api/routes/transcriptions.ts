import express from "express";
import TranscriptionsController from "../controllers/TranscriptionsController"

//Initialize controller
const transcriptionsController: TranscriptionsController = new TranscriptionsController();

//Router
const transcriptionsRouter: express.Router = express.Router();

//Get Routes
transcriptionsRouter.post("/search", transcriptionsController.search);
 
//Export it
export default transcriptionsRouter; 