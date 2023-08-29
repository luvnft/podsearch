import { SegmentHit } from "../../types/SegmentResponse";

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
  // Extract the pure text without HTML tags from the highlighted text for matching
  console.log("MIOMIMI", segmentHit._formatted)
  const pureHighlightedText: string = segmentHit._formatted.text.replace(/<[^>]+>/g, "");

  // Find the index of the pure text within the combined text
  const indexOfHighlight = combinedText.indexOf(pureHighlightedText);

  // If the text was found, replace the regular word with the highlighted version
  if (indexOfHighlight !== -1) {
    // combinedText = combinedText.substring(0, indexOfHighlight) + highlightedText + combinedText.substring(indexOfHighlight + pureHighlightedText.length);
  }
  return combinedText;
}
