export enum InputMode {
  TEXT = 'text',
  IMAGE = 'image',
}

export enum TargetAI {
  MIDJOURNEY = 'Midjourney',
  STABLE_DIFFUSION = 'Stable Diffusion',
  DALL_E = 'DALL-E 3',
}

export interface PromptStructure {
  scene: string;
  subject: string;
  style: string;
  lighting: string;
  camera: string;
  details: string;
  mood: string;
  negativePrompt: string;
}

export type GenerationType = 'visual' | 'professional' | 'video';

export enum Language {
  PL = 'PL',
  EN = 'ENG',
}

export type Locale = 'pl' | 'en';