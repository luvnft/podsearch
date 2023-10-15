import ApiService from "./ApiService";

export default class AudioTranscriptionService extends ApiService {
  public constructor() {
    super();
  }

  public async uploadAudioFile(formData: any): Promise<string> {
    const res = await useFetch<any>("/audio/uploadAudio", {
      method: "POST",
      baseURL: this.API_BASE_URL,
      body: formData,
      immediate: true,
    });
    const data: any = res.data.value;
    return data;
  }
}
