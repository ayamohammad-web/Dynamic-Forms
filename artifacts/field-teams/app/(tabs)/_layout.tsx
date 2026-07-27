import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';

export default function AuthenticatedLayout() {
  const { isLoggedIn, isLoading } = useAuth();

  if (!isLoading && !isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="task/[id]" />
      <Stack.Screen name="form/[taskId]" />
      <Stack.Screen name="search" />
    </Stack>
  );
}
