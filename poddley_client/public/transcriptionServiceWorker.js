import TranscriptionService from "../utils/services/TranscriptionsService";
const transcriptionService = new TranscriptionService();

self.addEventListener("message", async (event) => {
  const { action, payload } = event.data;

  switch (action) {
    case "search":
      console.log("Inside Search, with payload: ", payload);
      const res = await transcriptionService.search(payload);
      self.postMessage({
        action: "searchCompleted",
        payload: res,
      });
      break;
  }
});
