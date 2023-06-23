//Average stuff needed
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import transcriptionsRouter from "./routes/transcriptions";
import imagesRouter from "./routes/images";

//Setup
const app: Express = express();
const port: number = 3000;

//Use helmet
app.use(helmet());

//Enable CORS for front-end use
app.use(cors());

//Enabling body
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//Use the routes
app.use("/transcriptions", transcriptionsRouter);
app.use("/images", imagesRouter);

//Listen on port
app.listen(port, () => {
  console.log(`Poddley API is listening at http://localhost:${port}`);
});

//Export it
export { app };
