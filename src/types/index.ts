// User types
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type Gender = 'MALE' | 'FEMALE';
export type Language = 'AR' | 'EN';

export interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth?: string;
  profilePhotoUrl?: string;
  verificationStatus: VerificationStatus;
  verificationRejectedReason?: string;
  language: Language;
  status: UserStatus;
  createdAt: string;
}

export interface UserPreferences {
  notifyNewInvitation: boolean;
  notifyRsvpResponse: boolean;
  notifyEventReminder: boolean;
  notifyImportantDates: boolean;
  calendarSyncEnabled: boolean;
}

export interface UserSession {
  id: string;
  deviceType: string;
  deviceName: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

// Event types
export type EventType =
  | 'WEDDING'
  | 'ENGAGEMENT'
  | 'BIRTHDAY'
  | 'GRADUATION'
  | 'BABY_SHOWER'
  | 'EID_GATHERING'
  | 'PRIVATE_PARTY'
  | 'CONDOLENCE'
  | 'OTHER';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
export type RSVPStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'MAYBE';
export type InvitationChannel = 'SMS' | 'WHATSAPP' | 'IN_APP';
export type GenderRestriction = 'MIXED' | 'MALE_ONLY' | 'FEMALE_ONLY';

export interface Event {
  id: string;
  type: EventType;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  coverImageUrl?: string;
  coverImage?: number | string; // Local asset (number) or URL (string)
  status: EventStatus;
  startDate: string;
  endDate?: string;
  location?: string;
  locationAr?: string;
  locationLat?: number;
  locationLng?: number;
  guestCount?: number;
  hostId: string;
  host: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhotoUrl?: string;
  };
  sessions?: EventSession[];
  coHosts?: CoHost[];
  // Computed fields
  userRole?: 'HOST' | 'CO_HOST' | 'GUEST';
  myRsvpStatus?: RSVPStatus;
  stats?: EventStats;
  createdAt: string;
  updatedAt: string;
}

export interface EventSession {
  id: string;
  eventId: string;
  name: string;
  nameAr?: string;
  startTime: string;
  endTime: string;
  location?: string;
  locationAr?: string;
  genderRestriction: GenderRestriction;
  createdAt: string;
}

export interface CoHost {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
}

export interface EventStats {
  totalInvited: number;
  accepted: number;
  declined: number;
  maybe: number;
  pending: number;
  totalPlusOnes?: number;
}

// Invitation types
export interface Invitation {
  id: string;
  eventId: string;
  sessionId?: string;
  event?: Event;
  inviteeUserId?: string;
  inviteePhone?: string;
  inviteeName?: string;
  inviteeGender?: Gender;
  channel: InvitationChannel;
  rsvpStatus: RSVPStatus;
  rsvpAt?: string;
  plusOnes: number;
  viewedAt?: string;
  invitedByUserId: string;
  invitedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

// Media types
export type MediaType = 'IMAGE' | 'VIDEO';
export type MediaStatus = 'PROCESSING' | 'READY' | 'FAILED';
export type GenderSection = 'MALE' | 'FEMALE' | 'ALL';

export interface Media {
  id: string;
  eventId: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  status: MediaStatus;
  genderSection: GenderSection;
  caption?: string;
  durationSeconds?: number;
  uploaderId: string;
  uploader?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhotoUrl?: string;
  };
  createdAt: string;
}

// Notification types
export type NotificationType =
  | 'INVITATION_RECEIVED'
  | 'RSVP_RECEIVED'
  | 'RSVP_REMINDER'
  | 'EVENT_UPDATE'
  | 'EVENT_CANCELLED'
  | 'STORY_ADDED'
  | 'VERIFICATION_APPROVED'
  | 'VERIFICATION_REJECTED'
  | 'IMPORTANT_DATE_REMINDER';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body?: string;
  eventId?: string;
  invitationId?: string;
  isRead: boolean;
  createdAt: string;
}

// Important dates
export type ImportantDateType = 'BIRTHDAY' | 'ANNIVERSARY' | 'OTHER';

export interface ImportantDate {
  id: string;
  type: ImportantDateType;
  title: string;
  date: string;
  notes?: string;
  reminderEnabled: boolean;
  coverImage?: number | string; // Local asset (number) or URL (string)
  createdAt: string;
}

// Cards / Invitation Templates
export interface CardTemplate {
  id: string;
  name: string;
  nameAr?: string;
  previewUrl: string;
  category: string;
  isActive: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
    pagination?: {
      total: number;
      hasMore: boolean;
      nextCursor?: string;
      prevCursor?: string;
    };
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
