import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppDispatch } from '../../../redux/hooks';
import {
  fetchQuizReport,
  clearQuizReport,
} from '../../../redux/slices/quizAnalyticsSlice';
import AppHeader from '../header';

// Define type
interface AnalyticsOption {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

// Options
const analyticsOptions: AnalyticsOption[] = [
  { label: 'Subject-Wise Analysis', icon: 'stats-chart', route: '/components/QuizAnalytics/QuizSubjectAnalytics' },
  // { label: 'Difficulty-Wise Analysis', icon: 'trending-up', route: '/components/QuizAnalytics/DifficultyAnalytics' },
  // { label: 'Question-Type Analysis', icon: 'book', route: '/components/QuizAnalytics/QuestiontypeAnalysis' },
  { label: 'Difficulty-Wise Analysis', icon: 'trending-up', route: `/components/QuizAnalytics/DifficultyAnalytics?page=difficulty` },
  { label: 'Question-Type Analysis', icon: 'book', route: `/components/QuizAnalytics/DifficultyAnalytics?page=questionType` },
];

const QuizAnalyticsScreen = () => {
  const router = useRouter();
  const { quizId } = useLocalSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (typeof quizId === 'string') {
      dispatch(fetchQuizReport(quizId));
    }

    return () => {
      dispatch(clearQuizReport());
    };
  }, [quizId]);

  const handleOptionPress = (path: (typeof analyticsOptions)[number]['route']) => {
    router.push(path as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'right', 'left']}>
      {/* Header */}
       <AppHeader screenTitle="Quiz Analytics" onBackPress={() => router.back()} />

      {/* Scrollable Analytics Cards */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.buttonsContainer}>
          {analyticsOptions.map((option) => (
            <TouchableOpacity
              key={option.route}
              style={styles.card}
              onPress={() => handleOptionPress(option.route)}
              activeOpacity={0.85}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconWrapper}>
                  <Ionicons name={option.icon} size={22} color="#4F46E5" />
                </View>
                <Text style={styles.cardText}>{option.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footerText}>Tap an option to explore your analytics</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  buttonsContainer: {
    marginTop: 10,
    gap: 17,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6B7280',
    marginTop: 25,
    fontStyle: 'italic',
  },
});

export default QuizAnalyticsScreen;





