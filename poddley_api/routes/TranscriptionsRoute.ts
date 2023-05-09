import express from "express";
import TranscriptionsController from "../controllers/TranscriptionsController"

//Router
const transcriptionsRouter: express.Router = express.Router();

//Get Routes
transcriptionsRouter.get("/transcriptions", TranscriptionsController.search);

//Export it
export default transcriptionsRouter;