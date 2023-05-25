import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import fetch from "node-fetch";
import FormData from "form-data";
import axios from "axios";
dotenv.config({ path: "./.env" });
const prisma = new PrismaClient();
const apiUrl = "http://api.poddley.com/images/";
const imagesPath = "https://images.poddley.com/";
async function downScale() {
    const podcasts = await prisma.podcast.findMany({
        where: {
            imageUrl: {
                not: {
                    contains: "images.poddley.com",
                },
            },
        },
    });
    for (let i = 0; i < podcasts.length; i++) {
        const podcast = podcasts[i];
        const originalPodcastImage = podcast.imageUrl;
        const titleTrimmed = podcast.title;
        const titleLowerCased = titleTrimmed.toLowerCase();
        const titleSplitted = titleLowerCased.split(" ");
        const titleSplittedReplaced = titleSplitted.map((e) => e.replace(/[^a-z]/gi, ""));
        const titleSplittedJoined = titleSplittedReplaced.join("-");
        const newImageName = titleSplittedJoined + "-podcastImage";
        //Download image.
        const response = await fetch(originalPodcastImage);
        const buffer = await response.arrayBuffer();
        //Downscale it
        const imgBuffer = await sharp(buffer)
            .resize(400, 400, {
            fit: sharp.fit.contain,
            withoutEnlargement: true, // Do not upscale the image
        })
            .webp()
            .toBuffer();
        uploadImageToApi(imgBuffer, apiUrl, `${newImageName}.webp`)
            .then(async (response) => {
            console.log("Image uploaded successfully:", response);
            await prisma.podcast.update({
                where: {
                    id: podcast.id,
                },
                data: {
                    imageUrl: imagesPath + newImageName + ".webp",
                },
            });
            console.log("Done updating db");
        })
            .catch((error) => {
            console.error("Error uploading image:", error);
        });
    }
}
async function uploadImageToApi(buffer, apiUrl, filename) {
    try {
        // Create a FormData object to hold the image file and its metadata
        const formData = new FormData();
        formData.append("image", buffer, {
            filename: filename,
            contentType: "image/jpeg", // You can change this to the appropriate MIME type, depending on your image format (e.g., image/png, image/gif)
        });
        // Set up the axios request configuration
        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
                ...formData.getHeaders(),
            },
            auth: {
                username: process.env.API_USERNAME,
                password: process.env.API_PASSWORD,
            },
        };
        // Send the POST request to the API endpoint with the image data
        const response = await axios.post(apiUrl, formData, config);
        // Return the response data
        return response.data;
    }
    catch (error) {
        // Handle any errors that may occur during the upload process
        console.error("Error uploading image:", error);
        throw error;
    }
}
downScale();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bnNjYWxlUG9kY2FzdEltYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2Rvd25zY2FsZVBvZGNhc3RJbWFnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLE1BQU0sTUFBTSxRQUFRLENBQUMsQ0FBQyx5RUFBeUU7QUFDM0csT0FBTyxFQUFFLFlBQVksRUFBbUIsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvRCxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDMUIsT0FBTyxLQUFLLE1BQU0sWUFBWSxDQUFDO0FBQy9CLE9BQU8sUUFBUSxNQUFNLFdBQVcsQ0FBQztBQUNqQyxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFFMUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBRWxDLE1BQU0sTUFBTSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7QUFDbEMsTUFBTSxNQUFNLEdBQUcsZ0NBQWdDLENBQUM7QUFDaEQsTUFBTSxVQUFVLEdBQUcsNkJBQTZCLENBQUM7QUFFakQsS0FBSyxVQUFVLFNBQVM7SUFDdEIsTUFBTSxRQUFRLEdBQWMsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUN4RCxLQUFLLEVBQUU7WUFDTCxRQUFRLEVBQUU7Z0JBQ1IsR0FBRyxFQUFFO29CQUNILFFBQVEsRUFBRSxvQkFBb0I7aUJBQy9CO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3hDLE1BQU0sT0FBTyxHQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQyxNQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFFOUMsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FB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