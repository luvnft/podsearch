const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const sharp = require("sharp");
const fetch = require("node-fetch");
const FormData = require("form-data");
const axios = require("axios");

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

        const response = await fetch(originalPodcastImage);
        const buffer = await response.arrayBuffer();

        const imgBuffer = await sharp(buffer)
            .resize(400, 400, {
                fit: sharp.fit.contain,
                withoutEnlargement: true,
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
        const formData = new FormData();
        formData.append("image", buffer, {
            filename: filename,
            contentType: "image/jpeg",
        });

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

        const response = await axios.post(apiUrl, formData, config);
        return response.data;
    }
    catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
}

downScale();