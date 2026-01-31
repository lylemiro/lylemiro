export interface Project {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  description: string;
  tech: string[];
  role: string;
  url: string;
  image?: string; // Placeholder for image URL
}

export interface ColorScheme {
  name: string;
  hex: string;
}

export enum CursorState {
  DEFAULT = 'DEFAULT',
  HOVER = 'HOVER',
  CLICK = 'CLICK'
}