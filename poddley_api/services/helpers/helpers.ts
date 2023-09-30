import { SearchResponse, SearchResponseHit } from "../../types/SearchResponse";
import { SegmentHit } from "../../types/SegmentResponse";
import { convertSecondsToTime } from "../../utils/secondsToTime";

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

export function mergeHighlightedAndText(combinedText: string, segmentHit: SegmentHit): string {
  const pureHighlightedText = segmentHit._formatted.text.replace(/<[^>]+>/g, "");
  const indexOfHighlight = combinedText.indexOf(pureHighlightedText);
  
  if (indexOfHighlight !== -1) {
    combinedText = combinedText.substring(0, indexOfHighlight) + segmentHit._formatted.text + combinedText.substring(indexOfHighlight + pureHighlightedText.length);
  }
  return combinedText;
}

export function formatSearchResponse(searchResponse: SearchResponse): SearchResponse {
  searchResponse.hits.forEach(formatResponseHit);
  return searchResponse;
}

export function formatResponseHit(responseHit: SearchResponseHit): void {
  responseHit.subHits?.forEach((subHit, i) => formatSegmentHit(subHit, i));
}

export function formatSegmentHit(item: SegmentHit, i: number): void {
  const { start: startTime, end: endTime, text: segmentText, _formatted } = item;
  const text = i === 0 ? _formatted.text : segmentText;
  const words = text.split(" ");
  
  if (words.length <= 6) {
    formatSegment(startTime, text);
  } else {
    splitIntoFormattedSegments(startTime, endTime, words);
  }
}

export function splitIntoFormattedSegments(startTime: number, endTime: number, words: string[]): void {
  const durationPerWord = (endTime - startTime) / words.length;
  let segmentStartTime = startTime;

  while (words.length) {
    const segmentWords = words.splice(0, 6);
    const segmentEndTime = segmentStartTime + segmentWords.length * durationPerWord;
    
    formatSegment(segmentStartTime, segmentWords.join(" ").trim());
    segmentStartTime = segmentEndTime;
  }
}

export function formatSegment(startTime: number, text: string): string {
  return `<span class="text-gray-400">${convertSecondsToTime(startTime)}: </span><i>${text}</i>`;
}
