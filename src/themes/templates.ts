import { InvitationTemplate, ThemeFont } from './types';
import { EventType } from '../types';

// Available fonts for invitation customization
export const availableFonts: ThemeFont[] = [
  // English fonts
  { id: 'aniyah', name: 'Aniyah', nameAr: 'أنية', family: 'Aniyah' },
  { id: 'cormorant', name: 'Cormorant Garamond', nameAr: 'كورمورانت', family: 'CormorantGaramond_400Regular' },
  { id: 'cormorant-bold', name: 'Cormorant Bold', nameAr: 'كورمورانت عريض', family: 'CormorantGaramond_700Bold' },
  { id: 'lora', name: 'Lora', nameAr: 'لورا', family: 'Lora_400Regular' },
  { id: 'lora-bold', name: 'Lora Bold', nameAr: 'لورا عريض', family: 'Lora_700Bold' },
  { id: 'parisienne', name: 'Parisienne', nameAr: 'باريزيان', family: 'Parisienne_400Regular' },
  // Arabic fonts
  { id: 'amiri', name: 'Amiri', nameAr: 'أميري', family: 'Amiri_400Regular' },
  { id: 'amiri-bold', name: 'Amiri Bold', nameAr: 'أميري عريض', family: 'Amiri_700Bold' },
  { id: 'almarai', name: 'Almarai', nameAr: 'المراعي', family: 'Almarai_400Regular' },
  { id: 'almarai-bold', name: 'Almarai Bold', nameAr: 'المراعي عريض', family: 'Almarai_700Bold' },
  { id: 'layla', name: 'Layla Thuluth', nameAr: 'ليلى ثلث', family: 'LaylaThuluth' },
];

// Wedding Templates
export const weddingTemplates: InvitationTemplate[] = [
  {
    id: 'wedding-elegant-gold',
    name: 'Elegant Gold',
    nameAr: 'الذهبي الأنيق',
    eventTypes: ['WEDDING', 'ENGAGEMENT'],
    colors: {
      primary: '#D4AF37',
      secondary: '#1a1a1a',
      background: '#FFFEF7',
      text: '#1a1a1a',
      accent: '#B8860B',
    },
    titleFontEn: 'cormorant',
    bodyFontEn: 'lora',
    titleFontAr: 'amiri',
    bodyFontAr: 'amiri',
    cardStyle: 'classic',
    previewImage: null,
  },
  {
    id: 'wedding-rose-garden',
    name: 'Rose Garden',
    nameAr: 'حديقة الورد',
    eventTypes: ['WEDDING', 'ENGAGEMENT'],
    colors: {
      primary: '#E8B4B8',
      secondary: '#4A4A4A',
      background: '#FFF9FA',
      text: '#2D2D2D',
      accent: '#D4919A',
    },
    titleFontEn: 'parisienne',
    bodyFontEn: 'lora',
    titleFontAr: 'layla',
    bodyFontAr: 'almarai',
    cardStyle: 'classic',
    previewImage: null,
  },
  {
    id: 'wedding-royal-blue',
    name: 'Royal Blue',
    nameAr: 'الأزرق الملكي',
    eventTypes: ['WEDDING', 'ENGAGEMENT'],
    colors: {
      primary: '#1E3A5F',
      secondary: '#C9A227',
      background: '#F5F7FA',
      text: '#1E3A5F',
      accent: '#2E5077',
    },
    titleFontEn: 'cormorant',
    bodyFontEn: 'lora',
    titleFontAr: 'amiri',
    bodyFontAr: 'amiri',
    cardStyle: 'classic',
    previewImage: null,
  },
  {
    id: 'wedding-minimalist',
    name: 'Minimalist',
    nameAr: 'بسيط وأنيق',
    eventTypes: ['WEDDING', 'ENGAGEMENT'],
    colors: {
      primary: '#2C2C2C',
      secondary: '#888888',
      background: '#FFFFFF',
      text: '#2C2C2C',
      accent: '#555555',
    },
    titleFontEn: 'lora',
    bodyFontEn: 'lora',
    titleFontAr: 'almarai',
    bodyFontAr: 'almarai',
    cardStyle: 'modern',
    previewImage: null,
  },
  {
    id: 'wedding-arabic-classic',
    name: 'Arabic Classic',
    nameAr: 'كلاسيكي عربي',
    eventTypes: ['WEDDING', 'ENGAGEMENT'],
    colors: {
      primary: '#8B4513',
      secondary: '#DAA520',
      background: '#FDF5E6',
      text: '#3D2914',
      accent: '#CD853F',
    },
    titleFontEn: 'aniyah',
    bodyFontEn: 'lora',
    titleFontAr: 'layla',
    bodyFontAr: 'almarai',
    cardStyle: 'classic',
    previewImage: null,
  },
];

// Birthday Templates
export const birthdayTemplates: InvitationTemplate[] = [
  {
    id: 'birthday-colorful',
    name: 'Colorful Party',
    nameAr: 'حفلة ملونة',
    eventTypes: ['BIRTHDAY'],
    colors: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      background: '#FFF8E7',
      text: '#2D3436',
      accent: '#FFE66D',
    },
    titleFontEn: 'lora',
    bodyFontEn: 'lora',
    titleFontAr: 'almarai',
    bodyFontAr: 'almarai',
    cardStyle: 'modern',
    previewImage: null,
  },
  {
    id: 'birthday-elegant',
    name: 'Elegant Birthday',
    nameAr: 'عيد ميلاد أنيق',
    eventTypes: ['BIRTHDAY'],
    colors: {
      primary: '#6C5CE7',
      secondary: '#A29BFE',
      background: '#FAFAFE',
      text: '#2D3436',
      accent: '#DDD6FE',
    },
    titleFontEn: 'cormorant',
    bodyFontEn: 'lora',
    titleFontAr: 'amiri',
    bodyFontAr: 'amiri',
    cardStyle: 'classic',
    previewImage: null,
  },
  {
    id: 'birthday-kids',
    name: 'Kids Party',
    nameAr: 'حفلة أطفال',
    eventTypes: ['BIRTHDAY', 'BABY_SHOWER'],
    colors: {
      primary: '#00CEC9',
      secondary: '#FDCB6E',
      background: '#E8F8F5',
      text: '#2D3436',
      accent: '#81ECEC',
    },
    titleFontEn: 'lora',
    bodyFontEn: 'lora',
    titleFontAr: 'almarai',
    bodyFontAr: 'almarai',
    cardStyle: 'modern',
    previewImage: null,
  },
  {
    id: 'birthday-gold',
    name: 'Golden Age',
    nameAr: 'العصر الذهبي',
    eventTypes: ['BIRTHDAY'],
    colors: {
      primary: '#C9A227',
      secondary: '#1a1a1a',
      background: '#1a1a1a',
      text: '#FFFFFF',
      accent: '#D4AF37',
    },
    titleFontEn: 'cormorant',
    bodyFontEn: 'lora',
    titleFontAr: 'amiri',
    bodyFontAr: 'amiri',
    cardStyle: 'classic',
    previewImage: null,
  },
  {
    id: 'birthday-floral',
    name: 'Floral Dream',
    nameAr: 'حلم الزهور',
    eventTypes: ['BIRTHDAY'],
    colors: {
      primary: '#E84393',
      secondary: '#74B9FF',
      background: '#FFF0F5',
      text: '#2D3436',
      accent: '#FD79A8',
    },
    titleFontEn: 'parisienne',
    bodyFontEn: 'lora',
    titleFontAr: 'layla',
    bodyFontAr: 'almarai',
    cardStyle: 'modern',
    previewImage: null,
  },
];

// Graduation Templates
export const graduationTemplates: InvitationTemplate[] = [
  {
    id: 'graduation-classic',
    name: 'Classic Graduate',
    nameAr: 'تخرج كلاسيكي',
    eventTypes: ['GRADUATION'],
    colors: {
      primary: '#1B4332',
      secondary: '#D4AF37',
      background: '#F8F9FA',
      text: '#1B4332',
      accent: '#40916C',
    },
    titleFontEn: 'cormorant',
    bodyFontEn: 'lora',
    titleFontAr: 'amiri',
    bodyFontAr: 'amiri',
    cardStyle: 'classic',
    previewImage: null,
  },
  {
    id: 'graduation-modern',
    name: 'Modern Achievement',
    nameAr: 'إنجاز عصري',
    eventTypes: ['GRADUATION'],
    colors: {
      primary: '#2D3436',
      secondary: '#0984E3',
      background: '#FFFFFF',
      text: '#2D3436',
      accent: '#74B9FF',
    },
    titleFontEn: 'lora',
    bodyFontEn: 'lora',
    titleFontAr: 'almarai',
    bodyFontAr: 'almarai',
    cardStyle: 'modern',
    previewImage: null,
  },
  {
    id: 'graduation-festive',
    name: 'Festive Cap',
    nameAr: 'قبعة التخرج',
    eventTypes: ['GRADUATION'],
    colors: {
      primary: '#6C3483',
      secondary: '#F4D03F',
      background: '#F5EEF8',
      text: '#4A235A',
      accent: '#9B59B6',
    },
    titleFontEn: 'lora',
    bodyFontEn: 'lora',
    titleFontAr: 'almarai',
    bodyFontAr: 'almarai',
    cardStyle: 'modern',
    previewImage: null,
  },
];

// Eid & Gathering Templates
export const gatheringTemplates: InvitationTemplate[] = [
  {
    id: 'eid-crescent',
    name: 'Eid Crescent',
    nameAr: 'هلال العيد',
    eventTypes: ['EID_GATHERING'],
    colors: {
      primary: '#1D4E89',
      secondary: '#D4AF37',
      background: '#F0F4F8',
      text: '#1D4E89',
      accent: '#2E86AB',
    },
    titleFontEn: 'cormorant',
    bodyFontEn: 'lora',
    titleFontAr: 'amiri',
    bodyFontAr: 'amiri',
    cardStyle: 'classic',
    previewImage: null,
  },
  {
    id: 'eid-lantern',
    name: 'Eid Lantern',
    nameAr: 'فانوس العيد',
    eventTypes: ['EID_GATHERING'],
    colors: {
      primary: '#6B3FA0',
      secondary: '#F5C518',
      background: '#FAF5FF',
      text: '#4A235A',
      accent: '#8E44AD',
    },
    titleFontEn: 'lora',
    bodyFontEn: 'lora',
    titleFontAr: 'almarai',
    bodyFontAr: 'almarai',
    cardStyle: 'modern',
    previewImage: null,
  },
  {
    id: 'gathering-family',
    name: 'Family Reunion',
    nameAr: 'لم شمل العائلة',
    eventTypes: ['PRIVATE_PARTY', 'EID_GATHERING'],
    colors: {
      primary: '#2E86AB',
      secondary: '#A23B72',
      background: '#F7F9FC',
      text: '#2D3436',
      accent: '#45AAB8',
    },
    titleFontEn: 'lora',
    bodyFontEn: 'lora',
    titleFontAr: 'almarai',
    bodyFontAr: 'almarai',
    cardStyle: 'modern',
    previewImage: null,
  },
  {
    id: 'gathering-garden',
    name: 'Garden Party',
    nameAr: 'حفلة الحديقة',
    eventTypes: ['PRIVATE_PARTY'],
    colors: {
      primary: '#27AE60',
      secondary: '#F39C12',
      background: '#E8F6EF',
      text: '#1E5631',
      accent: '#58D68D',
    },
    titleFontEn: 'parisienne',
    bodyFontEn: 'lora',
    titleFontAr: 'layla',
    bodyFontAr: 'almarai',
    cardStyle: 'modern',
    previewImage: null,
  },
];

// Baby Shower Templates
export const babyShowerTemplates: InvitationTemplate[] = [
  {
    id: 'baby-boy',
    name: 'Baby Boy',
    nameAr: 'مولود ذكر',
    eventTypes: ['BABY_SHOWER'],
    colors: {
      primary: '#5DADE2',
      secondary: '#85C1E9',
      background: '#EBF5FB',
      text: '#1B4F72',
      accent: '#3498DB',
    },
    titleFontEn: 'lora',
    bodyFontEn: 'lora',
    titleFontAr: 'almarai',
    bodyFontAr: 'almarai',
    cardStyle: 'modern',
    previewImage: null,
  },
  {
    id: 'baby-girl',
    name: 'Baby Girl',
    nameAr: 'مولودة أنثى',
    eventTypes: ['BABY_SHOWER'],
    colors: {
      primary: '#F5B7B1',
      secondary: '#FADBD8',
      background: '#FDEDEC',
      text: '#78281F',
      accent: '#E74C3C',
    },
    titleFontEn: 'lora',
    bodyFontEn: 'lora',
    titleFontAr: 'almarai',
    bodyFontAr: 'almarai',
    cardStyle: 'modern',
    previewImage: null,
  },
  {
    id: 'baby-neutral',
    name: 'Sweet Baby',
    nameAr: 'طفل حلو',
    eventTypes: ['BABY_SHOWER'],
    colors: {
      primary: '#F9E79F',
      secondary: '#ABEBC6',
      background: '#FDFEFE',
      text: '#5D6D7E',
      accent: '#F4D03F',
    },
    titleFontEn: 'lora',
    bodyFontEn: 'lora',
    titleFontAr: 'almarai',
    bodyFontAr: 'almarai',
    cardStyle: 'modern',
    previewImage: null,
  },
];

// Get all templates
export const allTemplates: InvitationTemplate[] = [
  ...weddingTemplates,
  ...birthdayTemplates,
  ...graduationTemplates,
  ...gatheringTemplates,
  ...babyShowerTemplates,
];

// Get templates by event type
export const getTemplatesForEventType = (eventType: EventType): InvitationTemplate[] => {
  return allTemplates.filter(template => template.eventTypes.includes(eventType));
};

// Get template by ID
export const getTemplateById = (templateId: string): InvitationTemplate | undefined => {
  return allTemplates.find(template => template.id === templateId);
};

// Default template for each event type
export const getDefaultTemplate = (eventType: EventType): InvitationTemplate => {
  const templates = getTemplatesForEventType(eventType);
  return templates[0] || weddingTemplates[0];
};

// Color presets for customization
export const colorPresets = [
  { name: 'Gold', color: '#D4AF37' },
  { name: 'Rose', color: '#E8B4B8' },
  { name: 'Navy', color: '#1E3A5F' },
  { name: 'Burgundy', color: '#800020' },
  { name: 'Emerald', color: '#50C878' },
  { name: 'Purple', color: '#6C5CE7' },
  { name: 'Coral', color: '#FF6B6B' },
  { name: 'Teal', color: '#008080' },
  { name: 'Black', color: '#1a1a1a' },
  { name: 'White', color: '#FFFFFF' },
];
