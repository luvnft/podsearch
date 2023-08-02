import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import util from "util";
import { exec } from "child_process";
import { WhisperCppTranscriptionType, WhisperCppTranscription } from "../types/WhisperCppTranscriptionType";

const unlinkPromisified = util.promisify(fs.unlink);
const execPromisified = util.promisify(exec);

class AudioService {
  public async processAudioFile(file: Express.Multer.File): Promise<string> {
    // Define the name and path of the output file
    const outputFilePath = `${file.path}.wav`;

    try {
      // Convert the file
      await this.convertAudio(file.path, outputFilePath);

      // Run the main command on the converted file
      const mainCommand = `../whisper.cpp/main -m ../whisper.cpp/models/ggml-base.en.bin ${outputFilePath} -oj`;
      await execPromisified(mainCommand);

      const jsonData: string = fs.readFileSync(outputFilePath + ".json", "utf-8");
      const whisperCppTranscriptionType: WhisperCppTranscriptionType = JSON.parse(jsonData);

      // Delete the original and converted files
      await Promise.all([unlinkPromisified(file.path), unlinkPromisified(outputFilePath)]);

      return this.extractTranscriptionText(whisperCppTranscriptionType);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  private async convertAudio(inputPath: string, outputPath: string): Promise<void> {
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath).outputOptions("-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le").save(outputPath).on("end", resolve).on("error", reject);
    });
  }

  private extractTranscriptionText(transcriptionType: WhisperCppTranscriptionType): string {
    return (
      transcriptionType.transcription
        .map((transcription: WhisperCppTranscription) => transcription.text)
        .join(" ")
        .trim()
        .replace(/[^a-zA-Z0-9.,\s]/gi, "") || ""
    ); 
  }
}

export default AudioService;
