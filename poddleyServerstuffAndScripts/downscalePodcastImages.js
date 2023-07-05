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