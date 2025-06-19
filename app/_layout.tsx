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
import { View, Image, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';
import { store } from '../redux/store';

SplashScreen.preventAutoHideAsync(); // ✅ Prevent splash from auto-hiding

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('authToken');
      setIsLoggedIn(!!token); 
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
        <Image
          source={require('../assets/images/appIcon_1024x1024.png')}
          style={styles.icon}
        />
        <Image
          source={require('../assets/images/splash-icon.png')}
          style={styles.splashImage}
        />
      </View>
    );
  }

  return (
     <Provider store={store}> {/* ✅ Redux Provider */}
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } , animation: 'none' }}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  splashImage: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
  },
});
