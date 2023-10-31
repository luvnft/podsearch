import TranscriptionsServiceForServiceWorker  from "../utils/services/TranscriptionsServiceForServiceWorker";
const transcriptionsServiceForServiceWorker  = new TranscriptionsServiceForServiceWorker ();

self.addEventListener("message", async (event) => {
  const { action, payload } = event.data;
  const parsedPayload = JSON.parse(payload);
  switch (action) {
    case "search":
      try {
        const res = await transcriptionsServiceForServiceWorker.search(parsedPayload);
        
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
