import { EventType } from '../types';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

export interface ThemeFont {
  id: string;
  name: string;
  nameAr: string;
  family: string;
}

// Card visual style types
export type CardStyle = 'modern' | 'classic' | 'somber';

export interface InvitationTemplate {
  id: string;
  name: string;
  nameAr: string;
  eventTypes: EventType[];
  colors: ThemeColors;
  // English fonts
  titleFontEn: string;   // Font for English titles (Cormorant, Parisienne, Aniyah)
  bodyFontEn: string;    // Font for English body/description (Lora)
  // Arabic fonts
  titleFontAr: string;   // Font for Arabic titles (Layla, Amiri)
  bodyFontAr: string;    // Font for Arabic body/description (Almarai, Amiri)
  // Visual style
  cardStyle: CardStyle;  // 'modern' | 'classic' | 'somber'
  previewImage: any; // require() image
  isCondolence?: boolean;
  isPremium?: boolean;
}

export interface ThemeCustomization {
  templateId: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontId?: string;
  customMessage?: string;
  customMessageAr?: string;
  backgroundImage?: string;
}
