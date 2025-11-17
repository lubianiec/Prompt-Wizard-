export enum InputMode {
  TEXT = 'text',
  IMAGE = 'image',
}

export interface PromptStructure {
  scene: string;
  subject: string;
  outfit?: string;
  style: string;
  lighting: string;
  camera: string;
  details: string;
  mood: string;
  negativePrompt: string;
}

export type GenerationType = 'visual' | 'professional' | 'video' | 'imageEdit';

export enum Language {
  PL = 'PL',
  EN = 'ENG',
}

export type Locale = 'pl' | 'en';