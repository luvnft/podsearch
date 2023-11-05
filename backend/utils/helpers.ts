import { ClientSegmentHit } from "../types/ClientSearchResponse";
import { SegmentHit } from "../types/SegmentResponse";

export const convertSegmentHitToClientSegmentHit = (segmentHits: SegmentHit[]): ClientSegmentHit[] => {
  return segmentHits.map((hit: SegmentHit) => {
    return {
      text: hit.text,
      id: hit.id,
      start: hit.start,
      end: hit.end,
    };
  });
};
