import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import express, { Request } from "express";
import ImagesController from "../controllers/ImagesController";
import basicAuth from "express-basic-auth";

dotenv.config({ path: "../.env" });

//Authorization handler
const basicAuthorization = basicAuth({
  users: {
    [process.env.API_USERNAME as string]: [process.env.API_PASSWORD as string][0],
  },
  unauthorizedResponse: (req: Request) => {
    return "Unauthorized.";
  },
});

//Initialize controller
const imagesController: ImagesController = new ImagesController();

//Router
const imagesRouter: express.Router = express.Router();

//Get Routes
imagesRouter.get("/:filename", imagesController.getImage);

//Post Routes
imagesRouter.post("/", basicAuthorization, imagesController.uploadImage);

//Export it
export default imagesRouter;
