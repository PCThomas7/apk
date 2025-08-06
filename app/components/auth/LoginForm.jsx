import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import authService from '../../../services/authService';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import AuthOptions from '../GoogleAuth';

export default function LoginForm({ onLoginSuccess, onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const getPushToken = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default'
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission not granted to get push token');
        return null;
      }

      try {
        const { data: token } = await Notifications.getDevicePushTokenAsync();
        return token;
      } catch (e) {
        console.log('Error getting push token:', e);
        return null;
      }
    } else {
      console.log('Must use physical device for push notifications');
      return null;
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const pushToken = await getPushToken();
      const res = await authService.login(formData.email, formData.password, pushToken);
      const { token, refreshToken, user } = res.data;
      onLoginSuccess(token, refreshToken, user);
    } catch (err) {
      console.log("Login failed:", err.response?.data || err);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (googleData) => {
    try {
      const pushToken = await getPushToken();
      const userInfo = {
        name: googleData.name,
        email: googleData.email,
        sub: googleData.sub,
        pushToken: pushToken || 'fallback-token'
      };
      const res = await authService.googleLogin(userInfo);
      const { token, refreshToken, user } = res.data;
      onLoginSuccess(token, refreshToken, user);
    } catch (err) {
      console.log("Google login failed:", err.response?.data || err);
      Alert.alert('Error', 'Google login failed');
    }
  };

  return (
    <View style={loginStyles.container}>
      <View style={loginStyles.inputContainer}>
        <Text style={loginStyles.label}>Email</Text>
        <TextInput
          style={[loginStyles.input, errors.email && loginStyles.inputError]}
          placeholder="Enter your email"
          placeholderTextColor="#9CA3AF"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={loginStyles.errorText}>{errors.email}</Text>}
      </View>

      <View style={loginStyles.inputContainer}>
        <Text style={loginStyles.label}>Password</Text>
        <View style={loginStyles.passwordContainer}>
          <TextInput
            style={[loginStyles.passwordInput, errors.password && loginStyles.inputError]}
            placeholder="Enter your password"
            placeholderTextColor="#9CA3AF"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={loginStyles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={loginStyles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={loginStyles.errorText}>{errors.password}</Text>}
      </View>

      <TouchableOpacity style={loginStyles.forgotPassword}>
        <Text style={loginStyles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[loginStyles.loginButton, isLoading && loginStyles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={loginStyles.loginButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <View style={loginStyles.continuecontainer}>
        <View style={loginStyles.continueline} />
        <View style={loginStyles.continuetextContainer}>
          <Text style={loginStyles.continuetext}>Or continue with</Text>
        </View>
      </View>

      <AuthOptions
        isLoading={isLoading}
        handleGoogleSignIn={handleGoogleSignIn}
      />

      <View style={loginStyles.switchContainer}>
        <Text style={loginStyles.switchText}>Don't have an account? </Text>
        <TouchableOpacity onPress={onSwitchToSignup}>
          <Text style={loginStyles.switchLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  eyeText: {
    fontSize: 18,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: '#6B7280',
  },
  switchLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  continuecontainer: {
    position: 'relative',
    height: 20,
    justifyContent: 'center',
  },
  continueline: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB', // Tailwind border-gray-300
  },
  continuetextContainer: {
    alignSelf: 'center',
    backgroundColor: '#F3F4F6', // Tailwind bg-gray-100
    paddingHorizontal: 8,
  },
  continuetext: {
    fontSize: 12,
    color: '#6B7280', // Tailwind text-gray-500
  },
});