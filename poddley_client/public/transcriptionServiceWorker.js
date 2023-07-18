import TranscriptionsServiceSearch from "../utils/services/TranscriptionsServiceSearch";
const transcriptionsServiceSearch = new TranscriptionsServiceSearch();

self.addEventListener("message", async (event) => {
  const { action, payload } = event.data;

  switch (action) {
    case "search":
      try {
        console.log("Inside Search, with payload: ", payload);
        const res = await transcriptionsServiceSearch.search(payload);
        console.log(res);
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
