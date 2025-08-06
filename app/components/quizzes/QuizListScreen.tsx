import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import courseServiceGet from '../../../services/courseServiceGet';
import { setQuizzes, selectQuizCache, selectIsCacheValid } from '../../../redux/slices/quizSlice';
import ResponsiveSkeleton from '../skeltons/Skelton';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../header';

interface Quiz {
  _id: string;
  title: string;
  quizType: string;
  duration?: string;
  content: string;
  lock?: Boolean
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const QuizListScreen = () => {
  const { quizType } = useLocalSearchParams<{ quizType: string }>();
  const { examType } = useLocalSearchParams<{ examType: string }>();
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const { chapter } = useLocalSearchParams<{ chapter: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cachedQuizzes = useAppSelector((state) =>
    selectQuizCache(state, quizType || '', subject, chapter, examType)
  );

  const isCacheValid = useAppSelector((state) =>
    selectIsCacheValid(state, quizType || '', CACHE_DURATION, subject, chapter, examType)
  );

  const quizzes = useMemo(() => cachedQuizzes || [], [cachedQuizzes]);

  const screenTitle = useMemo(() => {
    switch (quizType) {
      case 'DPP': return 'Daily Practice Problems';
      case 'Short Exam': return 'Short Examinations';
      case 'Mock Exam': return 'Mock Examinations';
      default: return 'Practice Tests';
    }
  }, [quizType]);

  const fetchQuizzes = useCallback(async () => {
    if (!quizType || loading) return;

    try {
      setLoading(true);
      setError('');

      let fetchedQuizzes: Quiz[] = [];
      if (quizType === 'Mock Exam') {
        const response = await courseServiceGet.getDppQuizzes(quizType);
        fetchedQuizzes = response.quizzes || [];
      } else {
        if (!subject || !chapter || !examType) {
          throw new Error('Missing required parameters for this quiz type');
        }
        const response = await courseServiceGet.getDppQuizzesByFilter(
          quizType,
          subject,
          chapter,
          examType
        );
        fetchedQuizzes = response.quizzes || [];
      }

      dispatch(setQuizzes({
        quizType: quizType || '',
        quizzes: fetchedQuizzes.map((quiz) => ({
          _id: quiz._id,
          title: quiz.title,
          quizType: quiz.quizType,
          duration: quiz.duration,
          content: quiz.content,
          lock: quiz.lock,
        })),
        subject: subject || undefined,
        chapter: chapter || undefined,
        examType: examType || undefined
      }));
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [quizType, subject, chapter, examType, dispatch, loading]);

  useEffect(() => {
    if (!isCacheValid && !loading) {
      fetchQuizzes();
    }
  }, [isCacheValid, loading, fetchQuizzes]);

  const handleTakeQuiz = useCallback((contentId: string) => {
    router.push({
      pathname: '/components/quizzes/QuizAttemptScreen',
      params: { contentId: contentId },
    });
  }, [router]);


  const renderQuizCard = useCallback((quiz: Quiz) => (
    <View key={quiz._id}>
      <View
        style={styles.quizCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.quizTitle} numberOfLines={2}>{quiz.title}</Text>
            {quiz.quizType === 'Mock Exam' && (
              <View style={styles.quizTypeBadge}>
                <Text style={styles.quizTypeText}>Mock Exam</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.detailsContainer}>
          {quiz.duration && (
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.detailText}>{quiz.duration} min</Text>
            </View>
          )}
        </View>

        {quiz.lock && (
          <Text style={styles.lockInfoText}>This quiz is not yet live.</Text>
        )}

        <TouchableOpacity
          style={[
            styles.startButton,
            quiz.lock && { backgroundColor: '#d1d5db' }, // Gray when locked
          ]}
          onPress={() => handleTakeQuiz(quiz.content)}
          activeOpacity={0.9}
          disabled={!!quiz.lock}
        >

          <Text style={styles.startButtonText}>
            {quiz.lock ? "Locked" : "Start Quiz"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [handleTakeQuiz]);

  const quizList = useMemo(() => (
    <View style={styles.quizList}>
      {quizzes.map(renderQuizCard)}
    </View>
  ), [quizzes, renderQuizCard]);

  const errorView = useMemo(() => (
    <View style={styles.errorContainer}>
      <View style={styles.errorIcon}>
        <Ionicons name="warning" size={24} color="#dc2626" />
      </View>
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={fetchQuizzes}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  ), [error, fetchQuizzes]);

  const emptyView = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={48} color="#9ca3af" />
      <Text style={styles.emptyTitle}>No quizzes available</Text>
      <Text style={styles.emptyText}>
        No {quizType?.toLowerCase()} found at the moment.
      </Text>
    </View>
  ), [quizType]);

  if (loading && quizzes.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: 25 }]}>
        <AppHeader screenTitle={screenTitle} onBackPress={() => router.back()} />
        <ScrollView style={styles.content}>
          <ResponsiveSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        <AppHeader screenTitle={screenTitle} onBackPress={() => router.back()} />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {error ? errorView : quizzes.length === 0 ? emptyView : quizList}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  container: {
    flex: 1
  },
  content: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 16
  },
  quizCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    color: '#1f2937'
  },
  quizTypeBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8
  },
  quizTypeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '500'
  },
  detailsContainer: {
    marginBottom: 12
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailText: {
    marginLeft: 4,
    color: '#6b7280',
    fontSize: 14
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8
  },
  startButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    marginRight: 8
  },
  lockInfoText: {
    marginTop: 8,
    marginBottom: 4,
    color: '#ef4444', // Tailwind red-500
    fontSize: 13,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  errorIcon: {
    marginBottom: 16
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8
  },
  errorText: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '500'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 8
  },
  quizList: {
    paddingVertical: 16
  }
});

export default QuizListScreen;