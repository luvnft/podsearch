//Average stuff needed
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import transcriptionsRouter from "./routes/transcriptions";
import rateLimit from "express-rate-limit";
import audioServiceRouter from "./routes/audio";

//Limiter
const apiCallLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Disable the `X-RateLimit-*` headers
});

// File upload limiter
const fileUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 file uploads per hour
});

//Setup
const app: Express = express();
const port: number = 3000;

// Use helmet
app.use(helmet());

//Enable CORS for front-end use
app.use(cors());

//Enabling body
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

//Use the routes
app.use("/transcriptions", transcriptionsRouter);
app.use("/audio", fileUploadLimiter, audioServiceRouter);

// Apply the rate limiting middleware to all requests
app.use(apiCallLimiter);

//Listen on port
app.listen(port, () => {
  console.log(`Poddley API is listening at http://localhost:${port}`);
});

//Export it
export { app };
