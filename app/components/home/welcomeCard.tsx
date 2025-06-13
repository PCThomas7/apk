import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

interface StudentWelcomeBannerProps {}

const { width } = Dimensions.get('window');

export const StudentWelcomeBanner: React.FC<StudentWelcomeBannerProps> = () => {
  const [userName, setUserName] = useState<string>('Student');
  const currentHour = new Date().getHours();
  let greeting = 'Good evening';

  if (currentHour < 12) {
    greeting = 'Good morning';
  } else if (currentHour < 18) {
    greeting = 'Good afternoon';
  }

  // Animation values
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Function to get user details from SecureStore
  const getUserDetails = async () => {
    try {
      const userDetails = await SecureStore.getItemAsync('userDetails');
      if (userDetails) {
        const parsedUserDetails = JSON.parse(userDetails);
        if (parsedUserDetails?.name) {
          setUserName(parsedUserDetails.name);
        }
      }
    } catch (error) {
      console.log('Error getting user details:', error);
    }
  };

  useEffect(() => {
    // Get user details from SecureStore
    getUserDetails();

    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Icon bounce animation
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    bounceAnimation.start();

    return () => bounceAnimation.stop();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container, 
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <View style={styles.banner}>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.greeting}>
              {greeting}, {userName}!
            </Text>
            <Text style={styles.subtitle}>
              Welcome to your quiz dashboard. Track your progress and upcoming quizzes here.
            </Text>
          </View>
          
          <Animated.View 
            style={[
              styles.iconContainer,
              {
                transform: [{ translateY: bounceAnim }],
              }
            ]}
          >
            <Ionicons 
              name="school-outline" 
              size={48} 
              color="white" 
            />
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    marginTop: 20,
    marginHorizontal: 16,
  },
  banner: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});