import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import {
  selectRecentPerformance,
  selectAnalyticsLoading,
  fetchStudentAnalytics,
} from '../../../redux/slices/analyticsSlice';
import AppHeader from '../../components/header';

const PerformanceOverview = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const recentPerformance = useAppSelector(selectRecentPerformance);
  const isLoading = useAppSelector(selectAnalyticsLoading);

  useEffect(() => {
    dispatch(fetchStudentAnalytics());
  }, [dispatch]);


  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const getColor = (percentage: number) =>
    percentage >= 75 ? '#10B981' : percentage >= 50 ? '#F59E0B' : '#EF4444';

  const getIcon = (percentage: number) =>
    percentage >= 75 ? 'trending-up' : percentage >= 50 ? 'remove-outline' : 'trending-down';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader screenTitle="Performance Overview" onBackPress={() => router.back()} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : recentPerformance.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="stats-chart" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Performance Data</Text>
          <Text style={styles.emptySubtitle}>Your quiz results will appear here</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Recent Attempts</Text>

          {recentPerformance.map((quiz, index) => {
            const percentageColor = getColor(quiz.percentage);
            const icon = getIcon(quiz.percentage);

            return (
              <View key={index} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.quizDate}>{formatDate(quiz.submittedAt)}</Text>
                  <View style={[styles.percentageBadge, { backgroundColor: `${percentageColor}20` }]}>
                    <Ionicons name={icon} size={16} color={percentageColor} style={styles.trendIcon} />
                    <Text style={[styles.percentageText, { color: percentageColor }]}>
                      {quiz.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>

                <Text style={styles.quizTitle}>{quiz.quizTitle}</Text>

                <View style={styles.statsRow}>
                  <View style={styles.statBlock}>
                    <Text style={styles.statLabel}>Your Score</Text>
                    <Text style={styles.statValue}>{quiz.score}</Text>
                  </View>

                  <View style={styles.statBlock}>
                    <Text style={styles.statLabel}>Max Score</Text>
                    <Text style={styles.statValue}>{quiz.maxScore}</Text>
                  </View>

                  <View style={styles.statBlock}>
                    <Text style={styles.statLabel}>Accuracy</Text>
                    <Text style={[styles.statValue, { color: percentageColor }]}>
                      {quiz.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Showing {recentPerformance.length} recent attempts
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  percentageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendIcon: {
    marginRight: 4,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '600',
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBlock: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default PerformanceOverview;
