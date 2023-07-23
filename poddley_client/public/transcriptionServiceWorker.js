import TranscriptionsServiceSearch from "../utils/services/TranscriptionsServiceSearch";
const transcriptionsServiceSearch = new TranscriptionsServiceSearch();

self.addEventListener("message", async (event) => {
  const { action, payload } = event.data;
  const parsedPayload = JSON.parse(payload);
  switch (action) {
    case "search":
      try {
        const res = await transcriptionsServiceSearch.search(parsedPayload);
        self.postMessage({
          action: "searchCompleted",
          payload: res,
        });
      } catch (e) {
        self.postMessage({
          action: "searchFailed",
          payload: "",
        });
      }
      break;
  }
});
