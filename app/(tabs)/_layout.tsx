import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Colors } from '../../src/constants/colors';

export default function TabLayout() {
  return (
    <NativeTabs
      tintColor={Colors.primary}
    >
      <NativeTabs.Trigger name="index">
        <Icon sf="house.fill" drawable="ic_home" />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="events">
        <Icon sf="calendar" drawable="ic_calendar" />
        <Label>Events</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="invitations">
        <Icon sf="envelope.fill" drawable="ic_envelope" />
        <Label>Invitations</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon sf="person.fill" drawable="ic_person" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
