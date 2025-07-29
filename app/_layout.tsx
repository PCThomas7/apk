// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useFonts } from 'expo-font';
// import { Stack, useRouter } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { useEffect, useState } from 'react';
// import * as SecureStore from 'expo-secure-store';
// import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// import { useColorScheme } from '@/hooks/useColorScheme';


// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const router = useRouter();

//   const [isAuthChecked, setIsAuthChecked] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   const [loaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   useEffect(() => {
//     const checkAuth = async () => {
//       const token = await SecureStore.getItemAsync('authToken');
//       setIsLoggedIn(!!token); 
//       setIsAuthChecked(true);
//     };
//     checkAuth();
//   }, []);

//   if (!loaded || !isAuthChecked) {
//     return null; // or a splash loader
//   }

//   return (
//     <SafeAreaProvider>
//       <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//         <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
//         <Stack screenOptions={{ 
//           headerShown: false,
//           contentStyle: { flex: 1 } // Ensure content takes full space
//         }}>
//           {isLoggedIn ? (
//             <Stack.Screen 
//               name="(tabs)" 
//               options={{ 
//                 headerShown: false,
//                 contentStyle: { paddingBottom: 0 } // Adjust as needed
//               }} 
//             />
//           ) : (
//             <Stack.Screen name="Auth" options={{ headerShown: false }} />
//           )}
//           <Stack.Screen name="+not-found" />
//         </Stack>
//       </ThemeProvider>
//     </SafeAreaProvider>
//   );
// }


import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import NotificationBanner from '../app/components/NotificationBanner';
import { useNotificationHandler } from '../hooks/useNotificationHandler';

SplashScreen.preventAutoHideAsync(); // ✅ Prevent splash from auto-hiding

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);
  const { notification, setNotification } = useNotificationHandler()

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const checkAuth = async () => {
      // const token = await SecureStore.getItemAsync('authToken');
      // setIsLoggedIn(!!token); 
      const token = await SecureStore.getItemAsync('authToken');
      const loggedIn = !!token;
      setIsLoggedIn(loggedIn);

      setIsAuthChecked(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const prepare = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // simulate load
      setAppIsReady(true);
      await SplashScreen.hideAsync(); // ✅ Only hide after ready
    };
    prepare();
  }, []);

  if (!loaded || !isAuthChecked || !appIsReady) {
    return (
      <View style={styles.container}>
        <View style={styles.overlay} />

        <Image
          source={require('../assets/images/splashScreen/splashscreenIcon.png')}
          style={styles.splashImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <Provider store={store}> {/* ✅ Redux Provider */}
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
              onJoinLive={(lessonId, courseId , sectionId ,chapterId ,content = '', title = '') => {
                setNotification(null);
                if (lessonId && courseId) {
                 router.push(`/components/courses/courseRoom?video=${encodeURIComponent(content)}&status=${''}&vediotitle=${encodeURIComponent(title)}&bookmarked=${false}&viewCount=${0}&watchTimeSeconds=${0}&totalTimeSeconds=${0}&lessonId=${lessonId}&courseId${courseId}&sectionId=${sectionId}&chapterId=${chapterId}`)
                }
              }}
            />
          )}

          <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 }, animation: 'none' }}>
            {isLoggedIn ? (
              <Stack.Screen name="(tabs)" />
            ) : (
              <Stack.Screen name="Auth" />
            )}
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
const window = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Dark background for better contrast
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff', // Semi-transparent dark overlay
  },
  splashImage: {
    width: window.width * 0.9, // 90% of screen width
    height: window.height * 0.9, // 90% of screen height
    transform: [{ scale: 2 }], // Slightly scale up the image
  },
});
