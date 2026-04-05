import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="submission-form" />
        <Stack.Screen name="vehicles/[id]" />
        <Stack.Screen name="admin-login" />
      </Stack>
    </SafeAreaProvider>
  );
}
