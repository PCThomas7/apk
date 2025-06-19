// // AuthScreen.js
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
//   StatusBar,
// } from 'react-native';
// import LoginForm from './LoginForm';
// import SignupForm from './SignupForm';
// import * as SecureStore from 'expo-secure-store';
// import { useNavigation } from '@react-navigation/native';

// const { width, height } = Dimensions.get('window');

// export default function AuthScreen() {
//   const [isLogin, setIsLogin] = useState(true);
//   const navigation = useNavigation()

//   const handleSwitch = () => {
//     setIsLogin(prev => !prev);
//   };

//   const handleLoginSuccess = async (token, userDetails) => {
//     try {
//       console.log('Login successful:', token);

//       // Store token securely (e.g., JWT or session ID)
//       await SecureStore.setItemAsync('authToken', token);
//       await SecureStore.setItemAsync('userDetails', JSON.stringify(userDetails));
//       // You can also store other user info if needed
//       // await SecureStore.setItemAsync('userId', userData.id);

//       navigation.replace("(tabs)");
//     } catch (err) {
//       console.error('Error saving token:', err);
//     }
//   };


//   return (
//     <SafeAreaView style={authStyles.safeArea}>
//       <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
//       <KeyboardAvoidingView
//         style={authStyles.container}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         {/* Background Gradient Effect */}
//         <View style={authStyles.headerContainer}>
//           <View style={authStyles.bookDesign}>
//             <View style={[authStyles.bookPage, authStyles.bookPage1]} />
//             <View style={[authStyles.bookPage, authStyles.bookPage2]} />
//             <View style={[authStyles.bookPage, authStyles.bookPage3]} />
//           </View>

//         </View>


//         {/* Form Container */}
//         <View style={authStyles.formContainer}>
//           {isLogin ? (
//             <LoginForm
//               onLoginSuccess={handleLoginSuccess}
//               onSwitchToSignup={handleSwitch}
//             />
//           ) : (
//             <SignupForm
//               onSwitchToLogin={handleSwitch}
//             />
//           )}
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const authStyles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//   },
//   container: {
//     flex: 1,
//   },
//   backgroundGradient: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: height * 0.4,
//     backgroundColor: '#1F3937',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//   },
//   header: {
//     paddingTop: 60,
//     paddingHorizontal: 24,
//     alignItems: 'center',
//     marginBottom: 40,
//   },
//   headerContainer: {
//     height: height * 0.28,
//     width: '100%',
//     backgroundColor: '#166088',
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//   },
//   bookDesign: {
//     position: 'absolute',
//     flexDirection: 'row',
//     bottom: 0,
//     height: '60%',
//     width: '100%',
//     justifyContent: 'center',
//     alignItems: 'flex-end',
//   },
//   bookPage: {
//     height: '100%',
//     width: 60,
//     marginHorizontal: 2,
//     borderTopLeftRadius: 5,
//     borderTopRightRadius: 5,
//   },
//   bookPage1: {
//     backgroundColor: '#1F7A8C',
//     height: '90%',
//   },
//   bookPage2: {
//     backgroundColor: '#BFDBF7',
//     height: '80%',
//   },
//   bookPage3: {
//     backgroundColor: '#1F7A8C',
//     height: '95%',
//   },
//   headerText: {
//     color: 'white',
//     fontSize: 28,
//     fontWeight: '800',
//     letterSpacing: 1,
//     textShadowColor: 'rgba(0,0,0,0.2)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//   },
//   welcomeText: {
//     fontSize: 32,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     marginBottom: 8,
//   },
//   subtitleText: {
//     fontSize: 16,
//     color: '#D1D5DB',
//     textAlign: 'center',
//   },
//   formContainer: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     paddingTop: 32,
//     paddingHorizontal: 24,
//     marginTop: -20,
//   },
// });


import React, { useState , useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import * as SecureStore from 'expo-secure-store';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const [isLogin, setIsLogin] = useState(true);
  const navigation = useNavigation();

  //to stick the AuthScreen without landscape
  useEffect(() => {
    // Lock orientation to portrait when this screen mounts
    const lockToPortrait = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };

    lockToPortrait();

    // Optional: restore to default on unmount
    return () => {
      ScreenOrientation.unlockAsync(); // or re-lock to desired default
    };
  }, []);

  const handleSwitch = () => {
    setIsLogin(prev => !prev);
  };

  const handleLoginSuccess = async (token, userDetails) => {
    try {
      console.log('Login successful:', token);
      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('userDetails', JSON.stringify(userDetails));
      navigation.replace("(tabs)");
    } catch (err) {
      console.error('Error saving token:', err);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={authStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={authStyles.headerContainer}>
          <View style={authStyles.bookDesign}>
            <View style={[authStyles.bookPage, authStyles.bookPage1]} />
            <View style={[authStyles.bookPage, authStyles.bookPage2]} />
            <View style={[authStyles.bookPage, authStyles.bookPage3]} />
          </View>
        </View>

        <View style={authStyles.formContainer}>
          {isLogin ? (
            <LoginForm
              onLoginSuccess={handleLoginSuccess}
              onSwitchToSignup={handleSwitch}
            />
          ) : (
            <SignupForm onSwitchToLogin={handleSwitch} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const authStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: '#1F3937',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 40,
  },
  headerContainer: {
    height: height * 0.28,
    width: '100%',
    backgroundColor: '#166088',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bookDesign: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: 0,
    height: '60%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  bookPage: {
    height: '100%',
    width: 60,
    marginHorizontal: 2,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  bookPage1: {
    backgroundColor: '#1F7A8C',
    height: '90%',
  },
  bookPage2: {
    backgroundColor: '#BFDBF7',
    height: '80%',
  },
  bookPage3: {
    backgroundColor: '#1F7A8C',
    height: '95%',
  },
  headerText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 32,
    paddingHorizontal: 24,
    marginTop: -20,
  },
});