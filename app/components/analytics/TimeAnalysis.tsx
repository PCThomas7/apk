import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../../../redux/hooks';
import { selectTimeSpentAnalysis } from '../../../redux/slices/analyticsSlice';
import AppHeader from '../../components/header';

const TimeAnalysis = () => {
  const router = useRouter();
  const timeData = useAppSelector(selectTimeSpentAnalysis) || {
    totalTimeSpent: 0,
    averageTimePerQuiz: 0,
    averageTimePerQuestion: 0
  };


 const formatTime = (seconds: number): string => {
  const safeSeconds = seconds || 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);
  return `${minutes > 0 ? `${minutes}m ` : ''}${remainingSeconds}s`;
};


  if (!timeData || Object.keys(timeData).length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
         <AppHeader screenTitle="Time Analysis" onBackPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </SafeAreaView>
    );
  }

  const getTimeInsight = (time: number, type: 'quiz' | 'question'): string => {
  const safeTime = time || 0;
  if (type === 'quiz') {
    return safeTime < 600
      ? 'You complete quizzes quickly, which shows good efficiency!'
      : 'You take your time with quizzes, ensuring thorough understanding.';
  } else {
    return safeTime < 30
      ? 'Quick responses show good recall, but ensure you read carefully.'
      : 'Thoughtful consideration leads to better accuracy.';
  }
};

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader screenTitle="Time Analysis" onBackPress={() => router.back()} />

      {/* Content */}
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionHeader}>Your Time Statistics</Text>
          <View style={styles.cardsContainer}>
            <View style={[styles.card, styles.primaryCard]}>
              <Ionicons name="time-outline" size={24} color="#4F46E5" />
              <Text style={styles.cardValue}>{formatTime(timeData.totalTimeSpent)}</Text>
              <Text style={styles.cardLabel}>Total Time</Text>
            </View>
            
            <View style={styles.card}>
              <Ionicons name="speedometer-outline" size={24} color="#10B981" />
              <Text style={styles.cardValue}>{formatTime(timeData.averageTimePerQuiz)}</Text>
              <Text style={styles.cardLabel}>Per Quiz</Text>
            </View>
            
            <View style={styles.card}>
              <Ionicons name="help-circle-outline" size={24} color="#F59E0B" />
              <Text style={styles.cardValue}>{formatTime(timeData.averageTimePerQuestion)}</Text>
              <Text style={styles.cardLabel}>Per Question</Text>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionHeader}>Performance Insights</Text>
          
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
              <Text style={styles.insightTitle}>Total Learning Time</Text>
            </View>
            <Text style={styles.insightText}>
              You've invested <Text style={styles.highlight}>{formatTime(timeData.totalTimeSpent)}</Text> in your learning journey.
              {(timeData.totalTimeSpent || 0) > 3600 ? ' That shows great dedication!' : ' Keep building your knowledge!'}
            </Text>
          </View>
          
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="analytics-outline" size={20} color="#4F46E5" />
              <Text style={styles.insightTitle}>Quiz Efficiency</Text>
            </View>
            <Text style={styles.insightText}>
              Average of <Text style={styles.highlight}>{formatTime(timeData.averageTimePerQuiz)}</Text> per quiz.
              {' ' + getTimeInsight(timeData.averageTimePerQuiz, 'quiz')}
            </Text>
          </View>
          
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="timer-outline" size={20} color="#10B981" />
              <Text style={styles.insightTitle}>Question Response</Text>
            </View>
            <Text style={styles.insightText}>
              <Text style={styles.highlight}>{formatTime(timeData.averageTimePerQuestion)}</Text> per question on average.
              {' ' + getTimeInsight(timeData.averageTimePerQuestion, 'question')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    marginLeft: 4,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  primaryCard: {
    borderColor: '#E0E7FF',
    backgroundColor: '#F5F7FF',
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginVertical: 8,
  },
  cardLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  insightsContainer: {
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  highlight: {
    fontWeight: '600',
    color: '#111827',
  },
});

export default TimeAnalysis;