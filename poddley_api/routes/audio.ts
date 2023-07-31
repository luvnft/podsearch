import express from "express";
import AudioController from "../controllers/AudioController";
import multer from "multer";
import { Request, Response } from "express";

//Router
const audioServiceRouter: express.Router = express.Router();

//Initialize controller
const audioController: AudioController = new AudioController();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: any) => {
    cb(null, "uploads/");
  },
  filename: (req: Request, file: Express.Multer.File, cb: any) => {
    cb(null, file.originalname);
  },
});

//Multer limit stuff
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB
  },
});

//Get Routes
audioServiceRouter.post("/uploadAudio", upload.single("audio"), audioController.uploadAudio);
audioServiceRouter.post("/uploadAudioStream", audioController.uploadAudioStream);

//Export it
export default audioServiceRouter;
