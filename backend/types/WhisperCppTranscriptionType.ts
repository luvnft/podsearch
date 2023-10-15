export interface WhisperCppTranscriptionType {
  systeminfo: string;
  model: Model;
  params: Params;
  result: Result;
  transcription: WhisperCppTranscription[];
}

export interface Model {
  type: string;
  multilingual: boolean;
  vocab: number;
  audio: Audio;
  text: Text;
  mels: number;
  ftype: number;
}

export interface Audio {
  ctx: number;
  state: number;
  head: number;
  layer: number;
}

export interface Text {
  ctx: number;
  state: number;
  head: number;
  layer: number;
}

export interface Params {
  model: string;
  language: string;
  translate: boolean;
}

export interface Result {
  language: string;
}

export interface WhisperCppTranscription {
  timestamps: Timestamps;
  offsets: Offsets;
  text: string;
}

export interface Timestamps {
  from: string;
  to: string;
}

export interface Offsets {
  from: number;
  to: number;
}
