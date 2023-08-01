import ApiService from "./ApiService";

export default class AudioTranscriptionService extends ApiService {
  public constructor() {
    super();
  }

  public async uploadAudioFile(formData: any): Promise<string> {
    const res = await useFetch<any>("/audio/uploadAudio", {
      method: "POST",
      baseURL: this.BASE_URL,
      body: formData,
    });
    const data: any = res.data.value;
    return data;
  }
}