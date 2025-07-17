import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import {
  selectTopicWisePerformance,
  TopicPerformance,
} from '../../../redux/slices/quizAnalyticsSlice';

const QuizTopicAnalytics = () => {
  const router = useRouter();
  const { chapter, subject } = useLocalSearchParams();
  const decodedChapter = decodeURIComponent(chapter as string);
  const topicData = useSelector(selectTopicWisePerformance);
  const [data, setData] = useState<TopicPerformance[]>([]);

  useEffect(() => {
    if (topicData.length && subject && chapter) {
      const matched = topicData.filter(
        (item) => item.subject === subject && item.chapter === decodedChapter
      );
      setData(matched);
    }
  }, [topicData, subject, chapter]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Topic-Wise Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {data.length > 0 ? (
          data.map((item, index) => {
            const { correctAnswers, incorrectAnswers, unattempted, totalQuestions } = item;
            const total = totalQuestions || 1;
            const correctPct = (correctAnswers / total) * 100;
            const incorrectPct = (incorrectAnswers / total) * 100;
            const unattemptedPct = (unattempted / total) * 100;

            return (
              <View key={index} style={styles.card}>
                <Text style={styles.topicTitle}>{item.topic}</Text>

                {/* Progress Bar */}
                <View style={styles.progressBar}>
                  <View style={[styles.barSegment, { flex: correctPct, backgroundColor: '#10B981' }]} />
                  <View style={[styles.barSegment, { flex: incorrectPct, backgroundColor: '#EF4444' }]} />
                  <View style={[styles.barSegment, { flex: unattemptedPct, backgroundColor: '#9CA3AF' }]} />
                </View>

                {/* Stats */}
                <View style={styles.statRow}>
                  <Text style={styles.label}>Correct: {correctAnswers}</Text>
                  <Text style={styles.label}>Incorrect: {incorrectAnswers}</Text>
                  <Text style={styles.label}>Unattempted: {unattempted}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Total Questions:</Text>
                  <Text style={styles.value}>{item.totalQuestions}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Score:</Text>
                  <Text style={styles.value}>{item.score} / {item.maxScore}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Accuracy:</Text>
                  <Text
                    style={[
                      styles.value,
                      {
                        color:
                          item.percentage >= 75
                            ? '#10B981'
                            : item.percentage >= 50
                            ? '#F59E0B'
                            : '#EF4444',
                      },
                    ]}
                  >
                    {item.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noData}>No topics available</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    rowGap: 16,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  progressBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barSegment: {
    height: '100%',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  noData: {
    fontSize: 16,
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
  },
});

export default QuizTopicAnalytics;
