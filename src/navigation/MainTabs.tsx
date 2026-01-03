import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, HomeStackParamList, EventsStackParamList, CreateStackParamList, NotificationsStackParamList, ProfileStackParamList } from './types';
import { useAppSelector } from '../hooks';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/colors';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import EventsListScreen from '../screens/events/EventsListScreen';
import EventDetailsScreen from '../screens/events/EventDetailsScreen';
import EventStoryScreen from '../screens/events/EventStoryScreen';
import GuestListScreen from '../screens/events/GuestListScreen';
import SendCardScreen from '../screens/events/SendCardScreen';
import CreateEventScreen from '../screens/create/CreateEventScreen';
import AddSessionScreen from '../screens/create/AddSessionScreen';
import InviteGuestsScreen from '../screens/create/InviteGuestsScreen';
import NotificationsListScreen from '../screens/notifications/NotificationsListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ImportantDatesScreen from '../screens/profile/ImportantDatesScreen';
import BlockedUsersScreen from '../screens/profile/BlockedUsersScreen';

// Custom Tab Icon Component
const TabIcon = ({ name, focused, badge }: { name: string; focused: boolean; badge?: number }) => (
  <View style={styles.tabIconContainer}>
    <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperFocused]}>
      <Text style={[styles.tabIconText, focused && styles.tabIconTextFocused]}>{name}</Text>
    </View>
    {badge && badge > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
      </View>
    )}
  </View>
);

// Custom Tab Bar Background (Liquid Glass)
const TabBarBackground = () => (
  <BlurView
    intensity={80}
    tint="systemChromeMaterialLight"
    style={[StyleSheet.absoluteFill, { borderRadius: 35, overflow: 'hidden' }]}
  />
);

// Stack Navigators
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const EventsStack = createNativeStackNavigator<EventsStackParamList>();
const CreateStack = createNativeStackNavigator<CreateStackParamList>();
const NotificationsStack = createNativeStackNavigator<NotificationsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="EventDetails" component={EventDetailsScreen} />
      <HomeStack.Screen name="EventStory" component={EventStoryScreen} />
      <HomeStack.Screen name="GuestList" component={GuestListScreen} />
      <HomeStack.Screen name="SendCard" component={SendCardScreen} />
    </HomeStack.Navigator>
  );
}

function EventsStackNavigator() {
  return (
    <EventsStack.Navigator screenOptions={{ headerShown: false }}>
      <EventsStack.Screen name="EventsList" component={EventsListScreen} />
      <EventsStack.Screen name="EventDetails" component={EventDetailsScreen} />
      <EventsStack.Screen name="EventStory" component={EventStoryScreen} />
      <EventsStack.Screen name="GuestList" component={GuestListScreen} />
      <EventsStack.Screen name="SendCard" component={SendCardScreen} />
    </EventsStack.Navigator>
  );
}

function CreateStackNavigator() {
  return (
    <CreateStack.Navigator screenOptions={{ headerShown: false }}>
      <CreateStack.Screen name="CreateEvent" component={CreateEventScreen} />
      <CreateStack.Screen name="AddSession" component={AddSessionScreen} />
      <CreateStack.Screen name="InviteGuests" component={InviteGuestsScreen} />
    </CreateStack.Navigator>
  );
}

function NotificationsStackNavigator() {
  return (
    <NotificationsStack.Navigator screenOptions={{ headerShown: false }}>
      <NotificationsStack.Screen name="NotificationsList" component={NotificationsListScreen} />
    </NotificationsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="ImportantDates" component={ImportantDatesScreen} />
      <ProfileStack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
    </ProfileStack.Navigator>
  );
}

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarShowLabel: false,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="📅" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CreateTab"
        component={CreateStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.createButton}>
              <Text style={styles.createButtonText}>+</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="🔔" focused={focused} badge={unreadCount} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 0,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
    paddingBottom: 0,
  },
  tabBarItem: {
    paddingVertical: 10,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabIconWrapperFocused: {
    backgroundColor: 'rgba(120, 16, 74, 0.1)',
  },
  tabIconText: {
    fontSize: 22,
  },
  tabIconTextFocused: {
    transform: [{ scale: 1.1 }],
  },
  createButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 8,
  },
  createButtonText: {
    fontSize: 28,
    fontWeight: '300',
    color: Colors.white,
    marginTop: -2,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
});
