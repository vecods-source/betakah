import { Event, Notification, Invitation } from '../types';

// Current date helpers
const now = new Date();
const addDays = (days: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};
const subtractDays = (days: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Mock user (host) - English
const mockHostEN = {
  id: 'user-1',
  firstName: 'Mohammed',
  lastName: 'Al-Thani',
  profilePhotoUrl: undefined,
};

// Mock user (host) - Arabic
const mockHostAR = {
  id: 'user-1',
  firstName: 'محمد',
  lastName: 'آل ثاني',
  profilePhotoUrl: undefined,
};

// Mock other users - English
const mockUsersEN = [
  { id: 'user-2', firstName: 'Ahmed', lastName: 'Al-Kawari', profilePhotoUrl: undefined },
  { id: 'user-3', firstName: 'Fatima', lastName: 'Al-Attiyah', profilePhotoUrl: undefined },
  { id: 'user-4', firstName: 'Khaled', lastName: 'Al-Misnad', profilePhotoUrl: undefined },
  { id: 'user-5', firstName: 'Sara', lastName: 'Al-Suwaidi', profilePhotoUrl: undefined },
  { id: 'user-6', firstName: 'Abdullah', lastName: 'Al-Hajri', profilePhotoUrl: undefined },
  { id: 'user-7', firstName: 'Noura', lastName: 'Al-Mohannadi', profilePhotoUrl: undefined },
  { id: 'user-8', firstName: 'Youssef', lastName: 'Al-Khalifi', profilePhotoUrl: undefined },
  { id: 'user-9', firstName: 'Mariam', lastName: 'Al-Naimi', profilePhotoUrl: undefined },
];

// Mock other users - Arabic
const mockUsersAR = [
  { id: 'user-2', firstName: 'أحمد', lastName: 'الكواري', profilePhotoUrl: undefined },
  { id: 'user-3', firstName: 'فاطمة', lastName: 'العطية', profilePhotoUrl: undefined },
  { id: 'user-4', firstName: 'خالد', lastName: 'المسند', profilePhotoUrl: undefined },
  { id: 'user-5', firstName: 'سارة', lastName: 'السويدي', profilePhotoUrl: undefined },
  { id: 'user-6', firstName: 'عبدالله', lastName: 'الهاجري', profilePhotoUrl: undefined },
  { id: 'user-7', firstName: 'نورة', lastName: 'المهندي', profilePhotoUrl: undefined },
  { id: 'user-8', firstName: 'يوسف', lastName: 'الخليفي', profilePhotoUrl: undefined },
  { id: 'user-9', firstName: 'مريم', lastName: 'النعيمي', profilePhotoUrl: undefined },
];

// Combined for production
const mockHost = mockHostAR;
const mockUsers = mockUsersAR;

/*
 * MOCK DATA FOR TESTING:
 *
 * For testing, use language-specific exports:
 * - EN version: mockHostedEventsEN, mockInvitedEventsEN, mockNotificationsEN
 * - AR version: mockHostedEventsAR, mockInvitedEventsAR, mockNotificationsAR
 *
 * For production, use combined exports:
 * - mockHostedEvents, mockInvitedEvents, mockNotifications (all events)
 */

// ==================== ENGLISH MOCK DATA ====================

export const mockHostedEventsEN: Event[] = [
  {
    id: 'event-1',
    type: 'WEDDING',
    title: 'Mohammed & Sara Wedding',
    description: 'Join us for our special day as we celebrate our wedding ceremony',
    status: 'PUBLISHED',
    startDate: addDays(14),
    endDate: addDays(14),
    location: 'The Ritz-Carlton, Doha',
    locationLat: 25.3284,
    locationLng: 51.5310,
    guestCount: 150,
    hostId: 'user-1',
    host: mockHostEN,
    userRole: 'HOST',
    stats: {
      totalInvited: 150,
      accepted: 98,
      declined: 12,
      maybe: 15,
      pending: 25,
    },
    createdAt: subtractDays(30),
    updatedAt: subtractDays(2),
  },
  {
    id: 'event-3',
    type: 'EID_GATHERING',
    title: 'Eid Al-Fitr Family Gathering',
    description: 'Annual Eid celebration with the extended family',
    status: 'DRAFT',
    startDate: addDays(45),
    location: 'Family Majlis, Al-Rayyan',
    guestCount: 50,
    hostId: 'user-1',
    host: mockHostEN,
    userRole: 'HOST',
    stats: {
      totalInvited: 0,
      accepted: 0,
      declined: 0,
      maybe: 0,
      pending: 0,
    },
    createdAt: subtractDays(5),
    updatedAt: subtractDays(5),
  },
  {
    id: 'event-10',
    type: 'GRADUATION',
    title: 'Omar Graduation Ceremony',
    description: 'Celebrating Omar graduation from Qatar University with honors',
    status: 'PUBLISHED',
    startDate: addDays(35),
    location: 'Qatar University, Education City',
    guestCount: 60,
    hostId: 'user-1',
    host: mockHostEN,
    userRole: 'HOST',
    stats: {
      totalInvited: 60,
      accepted: 42,
      declined: 5,
      maybe: 8,
      pending: 5,
    },
    createdAt: subtractDays(10),
    updatedAt: subtractDays(2),
  },
];

export const mockInvitedEventsEN: Event[] = [
  {
    id: 'event-4',
    type: 'WEDDING',
    title: 'Ahmed & Noura Wedding',
    description: 'We are delighted to invite you to our wedding celebration',
    status: 'PUBLISHED',
    startDate: addDays(21),
    location: 'Sheraton Grand Doha Resort',
    locationLat: 25.3195,
    locationLng: 51.4945,
    guestCount: 200,
    hostId: 'user-2',
    host: mockUsersEN[0],
    userRole: 'GUEST',
    myRsvpStatus: 'PENDING',
    createdAt: subtractDays(20),
    updatedAt: subtractDays(10),
  },
  {
    id: 'event-6',
    type: 'BABY_SHOWER',
    title: 'Sara Baby Shower',
    description: 'Join us to celebrate the upcoming arrival of baby Al-Suwaidi',
    status: 'PUBLISHED',
    startDate: addDays(5),
    location: 'W Doha Hotel & Residences',
    guestCount: 40,
    hostId: 'user-5',
    host: mockUsersEN[3],
    userRole: 'GUEST',
    myRsvpStatus: 'ACCEPTED',
    createdAt: subtractDays(10),
    updatedAt: subtractDays(3),
  },
  {
    id: 'event-8',
    type: 'PRIVATE_PARTY',
    title: 'New Year Eve Party 2026',
    description: 'Ring in the new year with an unforgettable celebration',
    status: 'PUBLISHED',
    startDate: addDays(30),
    location: 'Sky View Lounge, The Torch Doha',
    guestCount: 60,
    hostId: 'user-2',
    host: mockUsersEN[0],
    userRole: 'GUEST',
    myRsvpStatus: 'MAYBE',
    createdAt: subtractDays(7),
    updatedAt: subtractDays(2),
  },
  {
    id: 'event-13',
    type: 'BIRTHDAY',
    title: 'Noura 30th Birthday Celebration',
    description: 'Join us for a fabulous evening celebrating Noura turning 30',
    status: 'PUBLISHED',
    startDate: addDays(12),
    location: 'Nobu Doha, Four Seasons Hotel',
    guestCount: 35,
    hostId: 'user-7',
    host: mockUsersEN[5],
    userRole: 'GUEST',
    myRsvpStatus: 'PENDING',
    createdAt: subtractDays(8),
    updatedAt: subtractDays(4),
  },
  {
    id: 'event-15',
    type: 'OTHER',
    title: 'Charity Gala Dinner',
    description: 'Annual charity fundraiser supporting education initiatives in Qatar',
    status: 'PUBLISHED',
    startDate: addDays(25),
    location: 'Museum of Islamic Art, Doha',
    locationLat: 25.2959,
    locationLng: 51.5394,
    guestCount: 200,
    hostId: 'user-9',
    host: mockUsersEN[7],
    userRole: 'GUEST',
    myRsvpStatus: 'ACCEPTED',
    createdAt: subtractDays(14),
    updatedAt: subtractDays(7),
  },
];

export const mockNotificationsEN: Notification[] = [
  {
    id: 'notif-1',
    type: 'INVITATION_RECEIVED',
    title: 'New Invitation',
    body: 'Ahmed Al-Kawari invited you to Ahmed & Noura Wedding',
    eventId: 'event-4',
    invitationId: 'invitation-1',
    isRead: false,
    createdAt: subtractDays(1),
  },
  {
    id: 'notif-3',
    type: 'RSVP_RECEIVED',
    title: 'RSVP Response',
    body: 'Sara Al-Suwaidi declined your invitation to Youssef Birthday Party',
    eventId: 'event-2',
    isRead: true,
    createdAt: subtractDays(2),
  },
  {
    id: 'notif-5',
    type: 'RSVP_REMINDER',
    title: 'RSVP Reminder',
    body: 'Don\'t forget to respond to Al-Manaai Family Condolence invitation',
    eventId: 'event-7',
    invitationId: 'invitation-4',
    isRead: false,
    createdAt: subtractDays(0),
  },
  {
    id: 'notif-7',
    type: 'EVENT_REMINDER',
    title: 'Event Tomorrow',
    body: 'Sara Baby Shower is tomorrow!',
    eventId: 'event-6',
    isRead: false,
    createdAt: subtractDays(0),
  },
  {
    id: 'notif-9',
    type: 'INVITATION_RECEIVED',
    title: 'New Invitation',
    body: 'Abdullah Al-Hajri invited you to his engagement party',
    eventId: 'event-12',
    invitationId: 'invitation-6',
    isRead: false,
    createdAt: subtractDays(2),
  },
  {
    id: 'notif-11',
    type: 'RSVP_RECEIVED',
    title: 'RSVP Update',
    body: '12 guests accepted your invitation to Omar Graduation Ceremony',
    eventId: 'event-10',
    isRead: true,
    createdAt: subtractDays(4),
  },
  {
    id: 'notif-13',
    type: 'EVENT_UPDATE',
    title: 'Event Updated',
    body: 'Charity Gala Dinner venue has been changed to Museum of Islamic Art',
    eventId: 'event-15',
    isRead: false,
    createdAt: subtractDays(1),
  },
  {
    id: 'notif-15',
    type: 'INVITATION_RECEIVED',
    title: 'New Invitation',
    body: 'Noura Al-Mohannadi invited you to her 30th Birthday Celebration',
    eventId: 'event-13',
    invitationId: 'invitation-7',
    isRead: true,
    createdAt: subtractDays(6),
  },
];

// ==================== ARABIC MOCK DATA ====================

export const mockHostedEventsAR: Event[] = [
  {
    id: 'event-2',
    type: 'BIRTHDAY',
    title: 'حفلة عيد ميلاد يوسف الخامس',
    description: 'تعالوا نحتفل بعيد ميلاد يوسف الخامس! مرح وألعاب وكعكة للجميع',
    status: 'PUBLISHED',
    startDate: addDays(7),
    location: 'مدينة الألعاب، مهرجان الدوحة',
    guestCount: 30,
    hostId: 'user-1',
    host: mockHostAR,
    userRole: 'HOST',
    stats: {
      totalInvited: 30,
      accepted: 22,
      declined: 3,
      maybe: 2,
      pending: 3,
    },
    createdAt: subtractDays(14),
    updatedAt: subtractDays(1),
  },
  {
    id: 'event-9',
    type: 'ENGAGEMENT',
    title: 'حفل خطوبة عبدالرحمن ولطيفة',
    description: 'يسرنا دعوتكم لحضور حفل خطوبة عبدالرحمن ولطيفة',
    status: 'PUBLISHED',
    startDate: addDays(21),
    location: 'فندق سانت ريجيس، الدوحة',
    locationLat: 25.2867,
    locationLng: 51.5333,
    guestCount: 80,
    hostId: 'user-1',
    host: mockHostAR,
    userRole: 'HOST',
    stats: {
      totalInvited: 80,
      accepted: 55,
      declined: 8,
      maybe: 10,
      pending: 7,
    },
    createdAt: subtractDays(20),
    updatedAt: subtractDays(3),
  },
  {
    id: 'event-11',
    type: 'PRIVATE_PARTY',
    title: 'حفل ترقية في العمل',
    description: 'احتفال بمناسبة الترقية الجديدة مع الأصدقاء والعائلة',
    status: 'DRAFT',
    startDate: addDays(60),
    location: 'مطعم السلطان، اللؤلؤة',
    guestCount: 25,
    hostId: 'user-1',
    host: mockHostAR,
    userRole: 'HOST',
    stats: {
      totalInvited: 0,
      accepted: 0,
      declined: 0,
      maybe: 0,
      pending: 0,
    },
    createdAt: subtractDays(3),
    updatedAt: subtractDays(3),
  },
];

export const mockInvitedEventsAR: Event[] = [
  {
    id: 'event-5',
    type: 'GRADUATION',
    title: 'حفل تخرج فاطمة',
    description: 'نحتفل بتخرج فاطمة من جامعة قطر بمرتبة الشرف',
    status: 'PUBLISHED',
    startDate: addDays(10),
    location: 'جامعة قطر، المدينة التعليمية',
    guestCount: 80,
    hostId: 'user-3',
    host: mockUsersAR[1],
    userRole: 'GUEST',
    myRsvpStatus: 'ACCEPTED',
    createdAt: subtractDays(15),
    updatedAt: subtractDays(8),
  },
  {
    id: 'event-7',
    type: 'CONDOLENCE',
    title: 'عزاء عائلة المناعي',
    description: 'نتقدم بخالص العزاء لعائلة المناعي',
    status: 'PUBLISHED',
    startDate: addDays(2),
    location: 'مجلس المناعي، الوكرة',
    guestCount: 100,
    hostId: 'user-4',
    host: mockUsersAR[2],
    userRole: 'GUEST',
    myRsvpStatus: 'PENDING',
    createdAt: subtractDays(1),
    updatedAt: subtractDays(1),
  },
  {
    id: 'event-12',
    type: 'ENGAGEMENT',
    title: 'حفل خطوبة عبدالله ومريم',
    description: 'بكل الفرح والسرور ندعوكم لحضور حفل خطوبتنا',
    status: 'PUBLISHED',
    startDate: addDays(18),
    location: 'فندق موندريان الدوحة',
    locationLat: 25.3156,
    locationLng: 51.4432,
    guestCount: 120,
    hostId: 'user-6',
    host: mockUsersAR[4],
    userRole: 'GUEST',
    myRsvpStatus: 'ACCEPTED',
    createdAt: subtractDays(12),
    updatedAt: subtractDays(5),
  },
  {
    id: 'event-14',
    type: 'EID_GATHERING',
    title: 'سحور رمضان العائلي',
    description: 'دعوة لسحور عائلي في أجواء رمضانية مميزة',
    status: 'PUBLISHED',
    startDate: addDays(40),
    location: 'مجلس الخليفي، الخور',
    guestCount: 70,
    hostId: 'user-8',
    host: mockUsersAR[6],
    userRole: 'GUEST',
    myRsvpStatus: 'MAYBE',
    createdAt: subtractDays(6),
    updatedAt: subtractDays(2),
  },
  {
    id: 'event-16',
    type: 'BABY_SHOWER',
    title: 'حفل استقبال مولود مريم',
    description: 'ندعوكم للاحتفال معنا بقدوم المولود الجديد',
    status: 'PUBLISHED',
    startDate: addDays(8),
    location: 'فندق بارك حياة الدوحة',
    guestCount: 45,
    hostId: 'user-9',
    host: mockUsersAR[7],
    userRole: 'GUEST',
    myRsvpStatus: 'PENDING',
    createdAt: subtractDays(5),
    updatedAt: subtractDays(1),
  },
];

export const mockNotificationsAR: Notification[] = [
  {
    id: 'notif-2',
    type: 'RSVP_RECEIVED',
    title: 'رد على الدعوة',
    body: 'خالد المسند قبل دعوتك لحفل زفاف محمد وسارة',
    eventId: 'event-1',
    isRead: false,
    createdAt: subtractDays(1),
  },
  {
    id: 'notif-4',
    type: 'EVENT_UPDATE',
    title: 'تحديث المناسبة',
    body: 'تم تحديث موقع حفل تخرج فاطمة',
    eventId: 'event-5',
    isRead: false,
    createdAt: subtractDays(2),
  },
  {
    id: 'notif-6',
    type: 'INVITATION_RECEIVED',
    title: 'دعوة جديدة',
    body: 'أحمد الكواري دعاك لحضور حفلة رأس السنة ٢٠٢٦',
    eventId: 'event-8',
    invitationId: 'invitation-5',
    isRead: true,
    createdAt: subtractDays(5),
  },
  {
    id: 'notif-8',
    type: 'RSVP_RECEIVED',
    title: 'رد على الدعوة',
    body: '٥ ضيوف قبلوا دعوتك لحفل زفاف محمد وسارة',
    eventId: 'event-1',
    isRead: true,
    createdAt: subtractDays(3),
  },
  {
    id: 'notif-10',
    type: 'EVENT_REMINDER',
    title: 'تذكير بالمناسبة',
    body: 'حفل استقبال مولود مريم بعد ٣ أيام',
    eventId: 'event-16',
    isRead: false,
    createdAt: subtractDays(0),
  },
  {
    id: 'notif-12',
    type: 'INVITATION_RECEIVED',
    title: 'دعوة جديدة',
    body: 'يوسف الخليفي دعاك لحضور سحور رمضان العائلي',
    eventId: 'event-14',
    invitationId: 'invitation-8',
    isRead: false,
    createdAt: subtractDays(3),
  },
  {
    id: 'notif-14',
    type: 'RSVP_REMINDER',
    title: 'تذكير بالرد',
    body: 'لم ترد بعد على دعوة حفل خطوبة عبدالله ومريم',
    eventId: 'event-12',
    invitationId: 'invitation-6',
    isRead: false,
    createdAt: subtractDays(0),
  },
  {
    id: 'notif-16',
    type: 'RSVP_RECEIVED',
    title: 'رد على الدعوة',
    body: 'فاطمة العطية قبلت دعوتك لحفل خطوبة عبدالرحمن ولطيفة',
    eventId: 'event-9',
    isRead: true,
    createdAt: subtractDays(5),
  },
];

// ==================== COMBINED EXPORTS (for production) ====================

export const mockHostedEvents: Event[] = [...mockHostedEventsEN, ...mockHostedEventsAR];
export const mockInvitedEvents: Event[] = [...mockInvitedEventsEN, ...mockInvitedEventsAR];
export const mockNotifications: Notification[] = [...mockNotificationsEN, ...mockNotificationsAR];

// Mock invitations (for the invited events)
export const mockInvitationsEN: Invitation[] = mockInvitedEventsEN.map((event, index) => ({
  id: `invitation-en-${index + 1}`,
  eventId: event.id,
  event: event,
  inviteeUserId: 'user-1',
  inviteeName: 'Mohammed Al-Thani',
  inviteeGender: 'MALE',
  channel: 'IN_APP' as const,
  rsvpStatus: event.myRsvpStatus || 'PENDING',
  plusOnes: 0,
  invitedByUserId: event.hostId,
  invitedByUser: event.host,
  createdAt: event.createdAt,
}));

export const mockInvitationsAR: Invitation[] = mockInvitedEventsAR.map((event, index) => ({
  id: `invitation-ar-${index + 1}`,
  eventId: event.id,
  event: event,
  inviteeUserId: 'user-1',
  inviteeName: 'محمد آل ثاني',
  inviteeGender: 'MALE',
  channel: 'IN_APP' as const,
  rsvpStatus: event.myRsvpStatus || 'PENDING',
  plusOnes: 0,
  invitedByUserId: event.hostId,
  invitedByUser: event.host,
  createdAt: event.createdAt,
}));

export const mockInvitations: Invitation[] = [...mockInvitationsEN, ...mockInvitationsAR];

// Combine all events for the "all events" view
export const mockAllEventsEN: Event[] = [...mockHostedEventsEN, ...mockInvitedEventsEN];
export const mockAllEventsAR: Event[] = [...mockHostedEventsAR, ...mockInvitedEventsAR];
export const mockAllEvents: Event[] = [...mockHostedEvents, ...mockInvitedEvents];

// Upcoming events (next 30 days, sorted by date)
export const mockUpcomingEventsEN: Event[] = [...mockAllEventsEN]
  .filter(e => new Date(e.startDate) > now && new Date(e.startDate) < new Date(addDays(30)))
  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

export const mockUpcomingEventsAR: Event[] = [...mockAllEventsAR]
  .filter(e => new Date(e.startDate) > now && new Date(e.startDate) < new Date(addDays(30)))
  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

export const mockUpcomingEvents: Event[] = [...mockAllEvents]
  .filter(e => new Date(e.startDate) > now && new Date(e.startDate) < new Date(addDays(30)))
  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
