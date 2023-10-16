import { ClientSearchResponseHit, ClientSegmentHit, ClientSearchResponse } from "../types/ClientSearchResponse";

export type Utils = ReturnType<typeof useUtils>;

export const useUtils = () => {
  return {
    convertSecondsToTime,
    encodeQuery,
    decodeQuery,
    removeDuplicates,
    convertSegmentHitToFormattedText,
    fragmentSegmentHits,
    prepareImageLink,
  };
};

export const fragmentSegmentHits = (segmentHits: ClientSegmentHit[]) => {
  // Doing it:
  const fragmentedSegmentHits: ClientSegmentHit[] = segmentHits.reduce((accumulatedSegments: ClientSegmentHit[], segHit: ClientSegmentHit) => {
    let startTime: number = segHit.start as number;
    let endTime: number = segHit.end;
    let text: string = segHit.text;
    let words: string[] = text.split(/ (?![^<]*>)/g);

    // If bigger than 5 words, gotta make em smaller
    if (words.length > 5) {
      let segments: ClientSegmentHit[] = [];

      // Calculate duration per word in the original segment
      let durationPerWord: number = (endTime - startTime) / words.length;

      let segmentStartTime: number = startTime; // Initialize segmentStartTime for the first segment

      while (words.length) {
        // Splice is cutting the words from 0 and removes 6 returning them, leaving words 6 words less
        let segmentWords: string[] = words.splice(0, 5); // Adjust the '6' to disperse the words accordingly in the segments
        let segmentEndTime: number = segmentStartTime + segmentWords.length * durationPerWord; // Getting segmentEndTime which will be the new segmentStartTime for the next segment based on the durationperWord

        // Create and add the formatted segment to the segments array
        const newSegmentHit: ClientSegmentHit = {
          ...segHit,
          start: segmentStartTime,
          text: segmentWords.join(" "),
          end: segmentEndTime,
        };

        // Update the segmentStartTime for the next segment
        segmentStartTime = segmentEndTime;
        segments.push(newSegmentHit);
      }

      return [...accumulatedSegments, ...segments];
    }
    return [...accumulatedSegments, segHit];
  }, []);

  // There is a slight possibility that we should do some sorting here, but not sure...
  return fragmentedSegmentHits;
};

export function removeDuplicates(hits: any[], uniqueId: string): any[] {
  // Remove duplicates
  const uniqueHits: any[] = [];
  const seenSet: Set<string> = new Set();
  for (let hit of hits) {
    if (seenSet.has(hit[uniqueId])) continue;
    else {
      seenSet.add(hit[uniqueId]);
      uniqueHits.push(hit);
    }
  }
  return uniqueHits;
}

export function convertSecondsToTime(sec: number): string {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = Math.floor(sec % 60);

  const hoursString = hours.toString().padStart(2, "0");
  const minutesString = minutes.toString().padStart(2, "0");
  const secondsString = seconds.toString().padStart(2, "0");

  return `${hoursString}:${minutesString}:${secondsString}`;
}

export function encodeQuery(query: any) {
  if (!query) return undefined;
  try {
    return encodeURIComponent(JSON.stringify(query));
  } catch (e: any) {
    return undefined;
  }
}

export function decodeQuery(query: any) {
  if (!query) return undefined;
  try {
    const d = JSON.parse(decodeURIComponent(query));
    return d;
  } catch (e: any) {
    return undefined;
  }
}

export function convertSegmentHitToFormattedText(segmentHit: ClientSegmentHit): string {
  if (segmentHit && segmentHit.text) {
    let startTime: number = segmentHit.start as number;
    let endTime: number = segmentHit.end;
    let text: string = segmentHit.text;
    let words: string[] = text.split(/ (?![^<]*>)/g);

    // If bigger than 5 words, gotta make em smaller
    if (words.length > 5) {
      let segments: string[] = [];

      // Calculate duration per word in the original segment
      let durationPerWord: number = (endTime - startTime) / words.length;

      let segmentStartTime: number = startTime; // Initialize segmentStartTime for the first segment

      while (words.length) {
        // Splice is cutting the words from 0 and removes 6 returning them, leaving words 6 words less
        let segmentWords: string[] = words.splice(0, 5); // Adjust the '6' to disperse the words accordingly in the segments
        let segmentEndTime: number = segmentStartTime + segmentWords.length * durationPerWord; // Getting segmentEndTime which will be the new segmentStartTime for the next segment based on the durationperWord

        // Create and add the formatted segment to the segments array
        segments.push(`<time class = "not-italic">${convertSecondsToTime(segmentStartTime)}:</time> ${segmentWords.join(" ").trim()}`);

        // Update the segmentStartTime for the next segment
        segmentStartTime = segmentEndTime;
      }
      return segments.join("") || " ";
    }

    // If not, let'se goooo
    return `<time class = "not-italic">${convertSecondsToTime(startTime)}:</time> ${text}` || "";
  } else {
    return "";
  }
}

export const prepareImageLink = (cloudflareImageId: string, width: number) => `https://imagedelivery.net/lIUoO1zdA8rhNVUlNWC26w/${cloudflareImageId}/w=${width}`;
