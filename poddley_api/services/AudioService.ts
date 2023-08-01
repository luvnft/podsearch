import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import util from "util";
import { WhisperCppTranscriptionType, WhisperCppTranscription } from "../types/WhisperCppTranscriptionType";

class AudioService {
  public async processAudioFile(file: Express.Multer.File): Promise<string> {
    const unlinkPromisified = util.promisify(fs.unlink);

    // Define the name and path of the output file
    const outputFilePath = `${file.path}.wav`;

    try {
      // Convert the file
      await new Promise((resolve, reject) => {
        ffmpeg(file.path).outputOptions("-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le").save(outputFilePath).on("end", resolve).on("error", reject);
      });

      // Run the main command on the converted file
      const execPromisified = util.promisify(require("child_process").exec);
      const mainCommand = `../whisper.cpp/main -m ../whisper.cpp/models/ggml-base.en.bin ${outputFilePath} -oj`;
      const { stdout: mainStdout, stderr: mainStderr } = await execPromisified(mainCommand);

      // Check if file was saved as that is a sign of it being successful using outputFilePath
      let whisperCppTranscriptionType: WhisperCppTranscriptionType;
      if (fs.existsSync(outputFilePath)) {
        //Then parse the object like this
        const jsonData = fs.readFileSync(outputFilePath + ".json", 'utf-8');
        whisperCppTranscriptionType = JSON.parse(jsonData);
      } else {
        throw new Error("Error: Output file does not exist");
      }

      // Delete the original and converted files
      await Promise.all([unlinkPromisified(file.path), unlinkPromisified(outputFilePath)]);

      const stringToReturn: string[] = whisperCppTranscriptionType.transcription.map((transcription: WhisperCppTranscription) => transcription.text);
      return stringToReturn.join(" ").trim() || "";
    } catch (error: any) {
      console.error(`Error: ${error}`);
      throw new Error(error.message);
    }
  }
}

export default AudioService;
