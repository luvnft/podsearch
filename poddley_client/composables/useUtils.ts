export type Utils = ReturnType<typeof useUtils>;

export const useUtils = () => {
  return {
    convertSecondsToTime,
    encodeQuery,
    decodeQuery,
  };
};

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
  return encodeURIComponent(JSON.stringify(query));
}

export function decodeQuery(query: any) {
  if (!query) return undefined;
  return JSON.parse(decodeURIComponent(query));
}
