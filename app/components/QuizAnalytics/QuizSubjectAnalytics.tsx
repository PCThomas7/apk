import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectSubjectWisePerformance,
  selectOverallPerformance,
} from '../../../redux/slices/quizAnalyticsSlice';
import { SubjectPerformance } from '../../../redux/slices/quizAnalyticsSlice';

// Helper: Convert seconds to H M S format
const formatTime = (seconds: number = 0): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};

const QuizAnalytics = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const subjectData = useSelector(selectSubjectWisePerformance);
  const overallPerformanceData = useSelector(selectOverallPerformance);

  const handleBack = () => {
    router.back();
  };

  const handleChapterwiseNavigate = (subject: string) => {
    router.push(`/components/QuizAnalytics/QuizChapterAnalytics?subject=${subject}`);
  };

  const renderProgressBar = (correct: number, incorrect: number, unattempted: number) => {
    const total = correct + incorrect + unattempted || 1;
    const correctWidth = (correct / total) * 100;
    const incorrectWidth = (incorrect / total) * 100;
    const unattemptedWidth = (unattempted / total) * 100;

    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressSegment, { backgroundColor: '#10B981', width: `${correctWidth}%` }]} />
        <View style={[styles.progressSegment, { backgroundColor: '#EF4444', width: `${incorrectWidth}%` }]} />
        <View style={[styles.progressSegment, { backgroundColor: '#9CA3AF', width: `${unattemptedWidth}%` }]} />
      </View>
    );
  };

  const renderStatItem = (label: string, value: string | number) => (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.overviewTitle}>Subject-wise Performance</Text>

        {subjectData.map((subject: SubjectPerformance, index: number) => (
          <View key={index} style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <Text style={styles.subjectTitle}>{subject.subject}</Text>
              <Text style={styles.accuracyText}>{subject.percentage.toFixed(1)}% Accuracy</Text>
            </View>

            {renderProgressBar(subject.correctAnswers, subject.incorrectAnswers, subject.unattempted)}

            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Correct: {subject.correctAnswers}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>Incorrect: {subject.incorrectAnswers}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#9CA3AF' }]} />
                <Text style={styles.legendText}>Unattempted: {subject.unattempted}</Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              {renderStatItem('Total Questions', subject.totalQuestions)}
              {renderStatItem('Score', `${subject.score}/${subject.maxScore}`)}
              {renderStatItem(
                'Time Spent',
                formatTime(overallPerformanceData?.timeSpent ?? 0)
              )}
            </View>

            <TouchableOpacity
              onPress={() => handleChapterwiseNavigate(subject.subject)}
              style={styles.chapterButton}
            >
              <Text style={styles.chapterButtonText}>View Chapterwise Analytics</Text>
              <Ionicons name="chevron-forward" size={18} color="#4F46E5" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 20,
    marginLeft: 8,
  },
  subjectCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  accuracyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  progressBarContainer: {
    height: 12,
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#EDF2F7',
    marginBottom: 16,
  },
  progressSegment: {
    height: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
    rowGap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  chapterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  chapterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginRight: 8,
  },
});

export default QuizAnalytics;
