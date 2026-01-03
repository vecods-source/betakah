import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Auth Stack
export type AuthStackParamList = {
  LanguageSelection: undefined;
  Onboarding: undefined;
  Welcome: undefined;
  PhoneInput: undefined;
  OTPVerification: { phoneNumber: string };
  Registration: { registrationToken: string; phoneNumber: string };
  VerificationPending: undefined;
};

// Home Stack
export type HomeStackParamList = {
  HomeScreen: undefined;
  EventDetails: { eventId: string };
  EventStory: { eventId: string };
  GuestList: { eventId: string };
  SendCard: { eventId: string };
};

// Events Stack
export type EventsStackParamList = {
  EventsList: undefined;
  EventDetails: { eventId: string };
  EventStory: { eventId: string };
  GuestList: { eventId: string };
  SendCard: { eventId: string };
};

// Create Stack
export type CreateStackParamList = {
  CreateEvent: undefined;
  AddSession: { eventId: string };
  InviteGuests: { eventId: string };
};

// Notifications Stack
export type NotificationsStackParamList = {
  NotificationsList: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  Settings: undefined;
  ImportantDates: undefined;
  BlockedUsers: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  EventsTab: NavigatorScreenParams<EventsStackParamList>;
  CreateTab: NavigatorScreenParams<CreateStackParamList>;
  NotificationsTab: NavigatorScreenParams<NotificationsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  // Modals
  RSVPModal: { eventId: string; invitationId: string };
  MediaViewer: { mediaId: string };
  InvitationPreview: { eventId: string; templateId?: string };
};

// Screen props helpers
export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type HomeScreenProps<T extends keyof HomeStackParamList> = NativeStackScreenProps<
  HomeStackParamList,
  T
>;
export type HomeStackScreenProps<T extends keyof HomeStackParamList> = HomeScreenProps<T>;

export type EventsScreenProps<T extends keyof EventsStackParamList> = NativeStackScreenProps<
  EventsStackParamList,
  T
>;
export type EventsStackScreenProps<T extends keyof EventsStackParamList> = EventsScreenProps<T>;

export type CreateScreenProps<T extends keyof CreateStackParamList> = NativeStackScreenProps<
  CreateStackParamList,
  T
>;
export type CreateStackScreenProps<T extends keyof CreateStackParamList> = CreateScreenProps<T>;

export type NotificationsScreenProps<T extends keyof NotificationsStackParamList> = NativeStackScreenProps<
  NotificationsStackParamList,
  T
>;
export type NotificationsStackScreenProps<T extends keyof NotificationsStackParamList> = NotificationsScreenProps<T>;

export type ProfileScreenProps<T extends keyof ProfileStackParamList> = NativeStackScreenProps<
  ProfileStackParamList,
  T
>;
export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = ProfileScreenProps<T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
export type RootStackScreenProps<T extends keyof RootStackParamList> = RootScreenProps<T>;

// Declare global types for useNavigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
