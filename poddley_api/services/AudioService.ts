import { Request } from "express";
import fs from "fs";
import moment, { Moment } from "moment";
import path from "path";
import { v4 as uuidv4 } from "uuid";

class AudioService {
  // Unsure if we should support stream, seems like a gag to implement and error-handle
  public async processAudioStream(req: Request) {
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream("uploads/audio-stream.wav");
      const start: Moment = moment();

      req.pipe(writeStream);

      req.on("data", () => {
        if (moment().diff(start, "seconds") > 10) {
          writeStream.end();
          reject(new Error("Stream is too long. Limit is 10 seconds"));
        }
      });

      req.on("end", resolve);
      req.on("error", reject);
    });
  }

  public async processAudioFile(file: Express.Multer.File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // Generate a unique file name
      const uniqueFileName = uuidv4() + path.extname(file.originalname);

      // Move the file to a new location with the unique file name
      fs.rename(file.path, path.join("uploads", uniqueFileName), async (err) => {
        if (err) {
          reject("Error processing file");
        } else {
          // Process the file here
          // After processing the file, delete it
          fs.unlink(path.join("uploads", uniqueFileName), (err) => {
            if (err) {
              reject("Error deleting file");
            } else {
              resolve("File processed and deleted successfully");
            }
          });
        } 
      }); 
    });
  }
}

export default AudioService;
