import { Stack } from 'expo-router';

export default function EventLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="camera" />
      <Stack.Screen name="stories" />
      <Stack.Screen name="media" />
      <Stack.Screen name="guests" />
    </Stack>
  );
}
