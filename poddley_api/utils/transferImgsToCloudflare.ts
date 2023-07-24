// import * as dotenv from "dotenv";
// dotenv.config({ path: "../../.env" });

// import axios, { AxiosResponse } from "axios";
// import FormData from "form-data";
// import fs from "fs";
// import prismaConnection from "../other/prismaConnection";
// import { Episode, Podcast } from "@prisma/client";
// import { pipeline } from "stream";
// import { promisify } from "util";

// async function downloadAndSaveImage(imageUrl: string, imageFileName: string) {
//   const response = await axios.get(imageUrl, { responseType: "stream" });
//   const writer = fs.createWriteStream(`./${imageFileName}`);
//   await promisify(pipeline)(response.data, writer);
// }

// async function uploadImage(filename: string): Promise<AxiosResponse> {
//   const form = new FormData();
//   form.append("file", fs.createReadStream(filename));

//   const response = await axios({
//     method: "post",
//     url: "https://api.cloudflare.com/client/v4/accounts/cc664ea0e464c8171ed71af53a1e3f5b/images/v1",
//     data: form,
//     headers: {
//       Authorization: `Bearer OIKoTjXqdRZnPELLNDdf0CV8fYuz62hHP5rY502d`,
//       ...form.getHeaders(),
//     },
//   });

//   return response;
// }

// async function getEpisode(podcast: Podcast) {
//   const episode: Episode | null = await prismaConnection.episode.findFirst({
//     where: {
//       podcastGuid: podcast.podcastGuid,
//       AND: {
//         podcastImage: {
//           not: {
//             contains: "images.poddley.com",
//           },
//         },
//       },
//     },
//   });
//   return episode;
// }

// async function main() {
//   const allPodcasts: Podcast[] = await prismaConnection.podcast.findMany({
//     where: {
//       imageUrl: {
//         not: {
//           contains: "imagedelivery.net/lIUoO1zdA8rhNVUlNWC26w",
//         },
//       },
//     },
//   });

//   for (let i = 0; i < allPodcasts.length; i++) {
//     const podcast = allPodcasts[i];

//     const episode: Episode | null = await getEpisode(podcast);

//     // Is episode undefined
//     if (!episode) {
//       console.log("No episode darling.");
//       const count: number = await prismaConnection.episode.count({
//         where: {
//           podcastGuid: podcast.podcastGuid,
//         },
//       });
//       console.log("Number is : ", count);
//       continue;
//     }

//     const titleTrimmed = podcast.title;
//     const titleLowerCased = titleTrimmed.toLowerCase();
//     const titleSplitted = titleLowerCased.split(" ");
//     const titleSplittedReplaced = titleSplitted.map((e: string) => e.replace(/[^a-z]/gi, ""));
//     const titleSplittedJoined = titleSplittedReplaced.join("-");
//     const newImageName = titleSplittedJoined + "-podcastImage";

//     const imageName: string = newImageName;
//     const imageUrl: string = episode.podcastImage;
//     const imageType: string | undefined = imageUrl.split(".").pop();
//     const imageFileName: string = newImageName + "." + imageType;

//     // If any of them are undefined continue, skip
//     if (!podcast || !imageUrl || !imageName || !imageType) continue;

//     // Download and save the image
//     await downloadAndSaveImage(imageUrl, imageFileName);

//     // Prepare form data
//     const formData = new FormData();
//     formData.append("file", imageFileName); // Append the stream directly to form data

//     // Upload
//     let cloudFlareImageUrl;
//     try {
//       console.log("Uploading url: ", imageFileName);
//       const result = await uploadImage(imageFileName);
//       console.log(result.data);
//       cloudFlareImageUrl = "https://imagedelivery.net/lIUoO1zdA8rhNVUlNWC26w/" + result.data.result.id + "/public";
//     } catch (e) {
//       console.log("Error occurred");
//       // console.log(JSON.stringify(e));
//     }
//     if (!cloudFlareImageUrl) {
//       console.log("Error or some sort in the upload functionality ");
//       continue;
//     }
//     await prismaConnection.podcast.update({
//       where: {
//         podcastGuid: podcast.podcastGuid,
//       },
//       data: {
//         imageUrl: cloudFlareImageUrl,
//       },
//     });
//   }
// }

// main();
