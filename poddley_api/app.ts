//Average stuff needed
import express, { Express } from "express";
import cors from "cors";
import transcriptionsRouter from "./routes/transcriptions";
import compression from "compression";

process.env.NODE_ENV = "production";

//Setup
const app: Express = express();
const port: number = 3000;

//Enable CORS for front-end use and compression
app.use(compression());
app.use(cors());

//Enabling body
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

//Use the routes
app.use("/transcriptions", transcriptionsRouter);

//Listen on port
app.listen(port, () => {
  console.log(`Poddley API is listening at http://localhost:${port}`);
});

//Export it
export { app };
