import { SegmentHit } from "./SegmentResponse";

export interface MultiSearchQueryType {
  query: {
    q: string;
    filter: string;
    limit: number;
    sort?: string[];
    matchingStrategy?: string;
  };
  segmentId?: string;
  segmentHit?: SegmentHit;
  indexUid: string;
}
