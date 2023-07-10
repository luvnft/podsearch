//Average stuff needed
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import transcriptionsRouter from "./routes/transcriptions";
import imagesRouter from "./routes/images";
import rateLimit from 'express-rate-limit'

//Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Disable the `X-RateLimit-*` headers

})

//Setup
const app: Express = express();
const port: number = 3000;


//Use helmet
// app.use(helmet());

//Enable CORS for front-end use
app.use(cors());

//Enabling body
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//Use the routes 
app.use("/transcriptions", transcriptionsRouter);
app.use("/images", imagesRouter);

// Apply the rate limiting middl  eware to all requests 
app.use(limiter)

//Listen on port 
app.listen(port, () => {
  console.log(`Poddley API is listening at http://localhost:${port}`);
});
 
//Export it
export { app };
