export interface Toast {
  id: number;
  message: string;
  type: string;
  timeout: number;
  removing?: boolean;
  animationTime?: number;
}
