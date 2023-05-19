import { exec } from "child_process";
import { promisify } from "util";

const execPromisified = promisify(exec);

export async function downloadYouTubeAudio(videoUrl: string, outputFilename: string) {
  const command = `youtube-dl --extract-audio --audio-format mp3 -o "${outputFilename}" "${videoUrl}"`;

  try {
    const { stdout, stderr } = await execPromisified(command);

    if (stderr) {
      console.error(`Command execution failed: ${stderr}`);
      return;
    }

    console.log(`Audio downloaded: ${outputFilename}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}