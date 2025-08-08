import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import * as SecureStore from 'expo-secure-store';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAppDispatch } from '../../../redux/hooks';
import { login } from '../../../redux/slices/authSlice';
import { useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const [isLogin, setIsLogin] = useState(true);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
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

  const handleLoginSuccess = async (token, refreshToken, userDetails) => {
    try {
      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('userDetails', JSON.stringify(userDetails));
      dispatch(login({ token: token, refreshToken: refreshToken }));
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
          <Image
            source={require('../../../assets/images/auth/Loginscreen.png')}
            style={authStyles.headerImage}
            resizeMode="contain"
          />
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
  headerContainer: {
    height: height * 0.27,
    width: '100%',
    backgroundColor: '#fbe4eb',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
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