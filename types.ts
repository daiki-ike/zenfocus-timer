export enum TimerState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}

export interface Preset {
  label: string;
  minutes: number;
}

export interface AiResponse {
  tip: string;
}
