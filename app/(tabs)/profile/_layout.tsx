import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="memories" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="important-dates" />
      <Stack.Screen name="add-important-date" />
      <Stack.Screen name="blocked-users" />
      <Stack.Screen name="edit-profile" />
    </Stack>
  );
}
