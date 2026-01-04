import { Stack } from 'expo-router';

export default function CameraLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[eventId]" />
      <Stack.Screen name="preview" />
    </Stack>
  );
}
