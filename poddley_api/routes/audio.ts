import express from "express";
import AudioController from "../controllers/AudioController";
import { Request, Response } from "express";
import upload from "../middleware/multerConfig";

//Router
const audioServiceRouter: express.Router = express.Router();

//Initialize controller
const audioController: AudioController = new AudioController();

//Get Routes
audioServiceRouter.post("/uploadAudio", upload.single("audio"), audioController.uploadAudio);

//Export it
export default audioServiceRouter;
