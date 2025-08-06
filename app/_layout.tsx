import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Dimensions } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { login, logout, setLoading } from '../redux/slices/authSlice';
import LoadingScreen from './components/LoadingScreen';
import NotificationBanner from '../app/components/NotificationBanner';
import { useNotificationHandler } from '../hooks/useNotificationHandler';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <DelayedContent />
    </Provider>
  );
}

function DelayedContent() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments() as string[];

  const dispatch = useAppDispatch();
  const { isLoggedIn, isLoading } = useAppSelector((state) => state.auth);
  const { notification, setNotification } = useNotificationHandler();

  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      dispatch(setLoading(true));
      try {
        const token = await SecureStore.getItemAsync('authToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');

        if (token) {
          dispatch(login({ token, refreshToken: refreshToken || '' }));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error('Auth check error:', error);
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };
    checkAuth();
  }, [dispatch]);

  // Handle navigation based on authentication state
  useEffect(() => {
    if (isLoading) return; // Don't navigate while loading

    const inAuthGroup = segments[0] === 'Auth';
    const inTabsGroup = segments[0] === '(tabs)';

    if (isLoggedIn) {
      // User is logged in
      if (inAuthGroup) {
        // Redirect from Auth to tabs
        router.replace('/(tabs)');
      }
    } else {
      // User is not logged in
      if (inTabsGroup || segments.length === 0) {
        // Redirect to Auth if trying to access tabs or root
        router.replace('/Auth');
      }
    }
  }, [isLoggedIn, segments, isLoading]);

  if (!fontsLoaded || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        {notification && (
          <NotificationBanner
            title={notification.title}
            body={notification.body}
            color={notification.color}
            lessonId={notification.lessonId}
            courseId={notification.courseId}
            sectionId={notification.sectionId}
            chapterId={notification.chapterId}
            content={notification.content}
            action={notification.action}
            onJoinLive={(lessonId, courseId, sectionId, chapterId, content = '', title = '') => {
              setNotification(null);
              if (lessonId && courseId) {
                router.push(`/components/courses/courseRoom?video=${encodeURIComponent(content)}&status=${''}&vediotitle=${encodeURIComponent(title)}&bookmarked=${false}&viewCount=${0}&watchTimeSeconds=${0}&totalTimeSeconds=${0}&lessonId=${lessonId}&courseId=${courseId}&sectionId=${sectionId}&chapterId=${chapterId}`)
              }
            }}
            onDismiss={() => {
              requestAnimationFrame(() => {
                setTimeout(() => setNotification(null), 0);
              });
            }}
          />
        )}

        <Stack screenOptions={{
          headerShown: false,
          contentStyle: { flex: 1 },
          animation: 'none'
        }}>
          <Stack.Screen
            name="(tabs)"
            options={{
              // Remove the redirect prop - we handle this in useEffect
            }}
            listeners={({ navigation }) => ({
              beforeRemove: (e) => {
                if (e.data.action.type === 'GO_BACK') {
                  e.preventDefault();
                }
              }
            })}
          />
          <Stack.Screen
            name="Auth"
            options={{
              // Remove the redirect prop - we handle this in useEffect
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const window = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  }
});
