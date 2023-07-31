import { exec } from "child_process";
import fs from "fs";
import util from "util";

class AudioService {
  public async processAudioFile(file: Express.Multer.File): Promise<string> {
    const execPromisified = util.promisify(exec);
    const unlinkPromisified = util.promisify(fs.unlink);

    // Define the name and path of the output file
    const outputFilePath = `${file.path}.wav`;

    // Command to convert the input file to 16bit .wav format
    const convertCommand = `ffmpeg -i ${file.path} -ar 16000 -ac 1 -c:a pcm_s16le ${outputFilePath}`;

    try {
      // Convert the file
      const { stdout: convertStdout, stderr: convertStderr } = await execPromisified(convertCommand);

      if (convertStderr) {
        console.error(`Error converting file: ${convertStderr}`);
        throw new Error("Error converting file");
      }

      console.log(`Output of file conversion: ${convertStdout}`);

      // Run the main command on the converted file
      const mainCommand = `../whisper.cpp/main -m ../whisper.cpp/models/ggml-base.en.bin ${outputFilePath} -oj`;
      const { stdout: mainStdout, stderr: mainStderr } = await execPromisified(mainCommand);

      if (mainStderr) {
        console.error(`Error: ${mainStderr}`);
        throw new Error("Error processing file");
      }

      console.log(`Output: ${mainStdout}`);

      // Parse the output as JSON.
      let outputJson;
      try {
        outputJson = JSON.parse(mainStdout);
      } catch (error) {
        console.error("Error parsing JSON output:", error); 
        throw new Error("Error parsing JSON output");
      }

      console.log("Parsed JSON:", outputJson);

      // Delete the original and converted files
      await Promise.all([
        unlinkPromisified(file.path),
        unlinkPromisified(outputFilePath)
      ]);

      return "File processed and deleted successfully";

    } catch (error: any) {
      console.error(`Error: ${error}`);
      throw new Error(error.message);
    }
  }
}

export default AudioService;
