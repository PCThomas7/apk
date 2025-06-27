// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';

// export default function SignupForm({ onSignupSuccess, onSwitchToLogin }) {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//   });
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const validateForm = () => {
//     const newErrors = {};

//     // Name validation
//     if (!formData.name.trim()) {
//       newErrors.name = 'Name is required';
//     } else if (formData.name.trim().length < 2) {
//       newErrors.name = 'Name must be at least 2 characters';
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!emailRegex.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email';
//     }

//     // Password validation
//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     } else if (formData.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     }

//     // Confirm password validation
//     if (!formData.confirmPassword) {
//       newErrors.confirmPassword = 'Please confirm your password';
//     } else if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value,
//     }));

//     if (errors[field]) {
//       setErrors(prev => ({
//         ...prev,
//         [field]: null,
//       }));
//     }
//   };

//   const handleSignup = async () => {
//     if (!validateForm()) return;

//     setIsLoading(true);

//     // Simulate signup process
//     setTimeout(() => {
//       setIsLoading(false);
//       Alert.alert(
//         'Success!',
//         'Account created successfully!',
//         [{ text: 'OK', onPress: () => onSignupSuccess?.(formData) }]
//       );
//     }, 1000);
//   };

//   return (
//     <View style={signupStyles.container}>
//       {/* Name Input */}
//       <View style={signupStyles.inputContainer}>
//         <Text style={signupStyles.label}>Full Name</Text>
//         <TextInput
//           style={[signupStyles.input, errors.name && signupStyles.inputError]}
//           placeholder="Enter your full name"
//           placeholderTextColor="#9CA3AF"
//           value={formData.name}
//           onChangeText={(value) => handleInputChange('name', value)}
//           autoCapitalize="words"
//         />
//         {errors.name && <Text style={signupStyles.errorText}>{errors.name}</Text>}
//       </View>

//       {/* Email Input */}
//       <View style={signupStyles.inputContainer}>
//         <Text style={signupStyles.label}>Email</Text>
//         <TextInput
//           style={[signupStyles.input, errors.email && signupStyles.inputError]}
//           placeholder="Enter your email"
//           placeholderTextColor="#9CA3AF"
//           value={formData.email}
//           onChangeText={(value) => handleInputChange('email', value)}
//           keyboardType="email-address"
//           autoCapitalize="none"
//           autoCorrect={false}
//         />
//         {errors.email && <Text style={signupStyles.errorText}>{errors.email}</Text>}
//       </View>

//       {/* Password Input */}
//       <View style={signupStyles.inputContainer}>
//         <Text style={signupStyles.label}>Password</Text>
//         <View style={signupStyles.passwordContainer}>
//           <TextInput
//             style={[signupStyles.passwordInput, errors.password && signupStyles.inputError]}
//             placeholder="Create a password"
//             placeholderTextColor="#9CA3AF"
//             value={formData.password}
//             onChangeText={(value) => handleInputChange('password', value)}
//             secureTextEntry={!showPassword}
//           />
//           <TouchableOpacity
//             style={signupStyles.eyeIcon}
//             onPress={() => setShowPassword(!showPassword)}
//           >
//             <Text style={signupStyles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
//           </TouchableOpacity>
//         </View>
//         {errors.password && <Text style={signupStyles.errorText}>{errors.password}</Text>}
//       </View>

//       {/* Confirm Password Input */}
//       <View style={signupStyles.inputContainer}>
//         <Text style={signupStyles.label}>Confirm Password</Text>
//         <View style={signupStyles.passwordContainer}>
//           <TextInput
//             style={[signupStyles.passwordInput, errors.confirmPassword && signupStyles.inputError]}
//             placeholder="Confirm your password"
//             placeholderTextColor="#9CA3AF"
//             value={formData.confirmPassword}
//             onChangeText={(value) => handleInputChange('confirmPassword', value)}
//             secureTextEntry={!showConfirmPassword}
//           />
//           <TouchableOpacity
//             style={signupStyles.eyeIcon}
//             onPress={() => setShowConfirmPassword(!showConfirmPassword)}
//           >
//             <Text style={signupStyles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
//           </TouchableOpacity>
//         </View>
//         {errors.confirmPassword && <Text style={signupStyles.errorText}>{errors.confirmPassword}</Text>}
//       </View>

//       {/* Terms */}
//       <Text style={signupStyles.termsText}>
//         By signing up, you agree to our{' '}
//         <Text style={signupStyles.linkText}>Terms & Privacy Policy</Text>
//       </Text>

//       {/* Signup Button */}
//       <TouchableOpacity
//         style={[signupStyles.signupButton, isLoading && signupStyles.buttonDisabled]}
//         onPress={handleSignup}
//         disabled={isLoading}
//       >
//         {isLoading ? (
//           <ActivityIndicator color="#FFFFFF" />
//         ) : (
//           <Text style={signupStyles.signupButtonText}>Create Account</Text>
//         )}
//       </TouchableOpacity>

//       {/* Switch to Login */}
//       <View style={signupStyles.switchContainer}>
//         <Text style={signupStyles.switchText}>Already have an account? </Text>
//         <TouchableOpacity onPress={onSwitchToLogin}>
//           <Text style={signupStyles.switchLink}>Sign In</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const signupStyles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: 8,
//   },
//   input: {
//     height: 52,
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     fontSize: 16,
//     backgroundColor: '#F9FAFB',
//     color: '#111827',
//   },
//   inputError: {
//     borderColor: '#EF4444',
//     backgroundColor: '#FEF2F2',
//   },
//   passwordContainer: {
//     position: 'relative',
//   },
//   passwordInput: {
//     height: 52,
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingRight: 50,
//     fontSize: 16,
//     backgroundColor: '#F9FAFB',
//     color: '#111827',
//   },
//   eyeIcon: {
//     position: 'absolute',
//     right: 16,
//     top: 14,
//     padding: 4,
//   },
//   eyeText: {
//     fontSize: 18,
//   },
//   errorText: {
//     color: '#EF4444',
//     fontSize: 12,
//     marginTop: 4,
//     marginLeft: 4,
//   },
//   termsText: {
//     fontSize: 12,
//     color: '#6B7280',
//     textAlign: 'center',
//     lineHeight: 18,
//   },
//   linkText: {
//     color: '#3B82F6',
//     fontWeight: '500',
//   },
//   signupButton: {
//     backgroundColor: '#10B981',
//     height: 52,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 16,
//     marginBottom: 24,
//     shadowColor: '#10B981',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   buttonDisabled: {
//     opacity: 0.6,
//     shadowOpacity: 0,
//     elevation: 0,
//   },
//   signupButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   switchContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   switchText: {
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   switchLink: {
//     fontSize: 14,
//     color: '#3B82F6',
//     fontWeight: '600',
//   },
// });

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios'

export default function SignupForm({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

const handleSignup = async () => {
  if (!validateForm()) return;
  setIsLoading(true);

  try {
    const res = await axios.post("http://192.168.10.42:5000/api/auth/register", {
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    if (res.status === 200) {
      onSwitchToLogin();
    }
  } catch (error) {
    console.error('Signup error:', error.response?.data || error.message);
    alert('Signup failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={signupStyles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Full Name */}
          <View style={signupStyles.inputContainer}>
            <Text style={signupStyles.label}>Full Name</Text>
            <TextInput
              style={[signupStyles.input, errors.name && signupStyles.inputError]}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              autoCapitalize="words"
            />
            {errors.name && <Text style={signupStyles.errorText}>{errors.name}</Text>}
          </View>

          {/* Email */}
          <View style={signupStyles.inputContainer}>
            <Text style={signupStyles.label}>Email</Text>
            <TextInput
              style={[signupStyles.input, errors.email && signupStyles.inputError]}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && <Text style={signupStyles.errorText}>{errors.email}</Text>}
          </View>

          {/* Password */}
          <View style={signupStyles.inputContainer}>
            <Text style={signupStyles.label}>Password</Text>
            <View style={signupStyles.passwordContainer}>
              <TextInput
                style={[signupStyles.passwordInput, errors.password && signupStyles.inputError]}
                placeholder="Create a password"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={signupStyles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={signupStyles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={signupStyles.errorText}>{errors.password}</Text>}
          </View>

          {/* Confirm Password */}
          <View style={signupStyles.inputContainer}>
            <Text style={signupStyles.label}>Confirm Password</Text>
            <View style={signupStyles.passwordContainer}>
              <TextInput
                style={[signupStyles.passwordInput, errors.confirmPassword && signupStyles.inputError]}
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={signupStyles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={signupStyles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={signupStyles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          {/* Terms */}
          <Text style={signupStyles.termsText}>
            By signing up, you agree to our{' '}
            <Text style={signupStyles.linkText}>Terms & Privacy Policy</Text>
          </Text>

          {/* Signup Button */}
          <TouchableOpacity
            style={[signupStyles.signupButton, isLoading && signupStyles.buttonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={signupStyles.signupButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Switch to Login */}
          <View style={signupStyles.switchContainer}>
            <Text style={signupStyles.switchText}>Already have an account? </Text>
            <TouchableOpacity onPress={onSwitchToLogin}>
              <Text style={signupStyles.switchLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const signupStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 27
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
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  signupButton: {
    backgroundColor: '#10B981',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
    shadowColor: '#10B981',
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
  signupButtonText: {
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
});


