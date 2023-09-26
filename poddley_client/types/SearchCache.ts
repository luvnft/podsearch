import { Hit } from "./SearchResponse";

interface HitCache {
  [key: string]: HitObject;
}

interface HitObject {
  hits: Hit[];
  numberOfPages: number | undefined;
  lastFetchedPage: number | undefined;
}
