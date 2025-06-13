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

interface Quiz {
  _id: string;
  title: string;
  subject?: string;
  chapter?: string;
  examType?: string;
  duration?: number;
  totalQuestions?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  content?: string;
}

// Cache duration: 10 minutes
const CACHE_DURATION = 10 * 60 * 1000;

const QuizListScreen = () => {
  const { quizType, subject, chapter, examType } = useLocalSearchParams<{ 
    quizType: string;
    subject?: string;
    chapter?: string;
    examType?: string;
  }>();
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizzes, setQuizzesState] = useState<Quiz[]>([]);

  // Get current route name for cache differentiation
  const currentRoute = useMemo(() => {
    // You can get this from router or pass it as a param
    return 'quiz-list'; // or router.pathname, or a passed parameter
  }, []);

  // Use the new selector to get cached data
  const cachedQuizzes = useAppSelector((state) => 
    selectQuizCache(state, quizType || '', subject, chapter, examType, currentRoute)
  );

  // Check if cache is valid
  const isCacheValid = useAppSelector((state) =>
    selectIsCacheValid(state, quizType || '', CACHE_DURATION, subject, chapter, examType, currentRoute)
  );

  const screenTitle = useMemo(() => {
    switch (quizType) {
      case 'DPP': return 'Daily Practice Problems';
      case 'Short Exam': return 'Short Examinations';
      case 'Mock Exam': return 'Mock Examinations';
      default: return 'Practice Tests';
    }
  }, [quizType]);

  const fetchQuizzes = useCallback(async () => {
    if (!quizType) return;

    try {
      setLoading(true);
      setError('');
      
      const response = await courseServiceGet.getDppQuizzes(quizType);
      const fetchedQuizzes = response.quizzes || [];
      
      setQuizzesState(fetchedQuizzes);
      
      // Store in Redux with the new structure
      dispatch(setQuizzes({
        quizType,
        quizzes: fetchedQuizzes.map((quiz: Quiz) => ({
          id: quiz._id,
          title: quiz.title,
          duration: quiz.duration || 0,
          subject: quiz.subject,
          chapter: quiz.chapter,
          examType: quiz.examType,
          difficulty: quiz.difficulty,
          totalQuestions: quiz.totalQuestions
        })),
        subject,
        chapter,
        examType,
        route: currentRoute,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Unable to load quizzes. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [quizType, subject, chapter, examType, currentRoute, dispatch]);

  useEffect(() => {
    // Check if we have valid cached data first
    if (cachedQuizzes?.quizzes && cachedQuizzes.quizzes.length > 0 && isCacheValid) {
      // Convert cached data back to Quiz format with proper type handling
      const cachedQuizzesData: Quiz[] = cachedQuizzes.quizzes.map(quiz => ({
        _id: quiz.id,
        title: quiz.title,
        duration: quiz.duration || undefined,
        subject: quiz.subject || undefined,
        chapter: quiz.chapter || undefined,
        examType: quiz.examType || undefined,
        difficulty: (quiz.difficulty as 'Easy' | 'Medium' | 'Hard') || undefined,
        totalQuestions: quiz.totalQuestions || undefined,
        content: undefined // This field is not stored in cache
      }));
      setQuizzesState(cachedQuizzesData);
    } else {
      fetchQuizzes();
    }
  }, [cachedQuizzes, isCacheValid, fetchQuizzes]);

  const handleTakeQuiz = useCallback((quizId: string) => {
    // router.push(`/student/quizzes/take/${quizId}`);
    console.log('Taking quiz:', quizId);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const getCacheAge = useCallback(() => {
    if (!cachedQuizzes?.timestamp) return 'Not cached';
    
    const ageMs = Date.now() - cachedQuizzes.timestamp;
    const ageMinutes = Math.floor(ageMs / (1000 * 60));
    
    if (ageMinutes < 1) return 'Just now';
    if (ageMinutes === 1) return '1 minute ago';
    return `${ageMinutes} minutes ago`;
  }, [cachedQuizzes]);

  const renderQuizCard = useCallback((quiz: Quiz, index: number) => (
    <TouchableOpacity 
      key={quiz._id} 
      style={[styles.quizCard, { marginTop: index === 0 ? 0 : 12 }]}
      onPress={() => handleTakeQuiz(quiz.content || quiz._id)}
      activeOpacity={0.95}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.quizNumber}>
            <Text style={styles.quizNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.titleSection}>
            <Text style={styles.quizTitle} numberOfLines={2}>
              {quiz.title}
            </Text>
            {quiz.subject && (
              <Text style={styles.subjectText}>{quiz.subject}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoGrid}>
          {quiz.chapter && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Chapter</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{quiz.chapter}</Text>
            </View>
          )}
          
          {quiz.examType && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{quiz.examType}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{quiz.duration || '—'}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{quiz.totalQuestions || '—'}</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          
          {quiz.difficulty && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{quiz.difficulty}</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.startButton}>
          <Text style={styles.startButtonText}>Start Practice</Text>
          <Text style={styles.startArrow}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleTakeQuiz]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading your practice tests...</Text>
          <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{screenTitle}</Text>
          {subject && <Text style={styles.headerSubtitle}>{subject}</Text>}
          {chapter && <Text style={styles.headerDetail}>{chapter}</Text>}
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {error ? (
          <View style={styles.messageContainer}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>!</Text>
            </View>
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={fetchQuizzes}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : quizzes.length === 0 ? (
          <View style={styles.messageContainer}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>📚</Text>
            </View>
            <Text style={styles.emptyTitle}>No practice tests available</Text>
            <Text style={styles.emptyText}>
              No {quizType?.toLowerCase()} found for {subject || 'this selection'}.
            </Text>
            <Text style={styles.emptySubtext}>
              Try exploring other subjects or check back later for new content.
            </Text>
          </View>
        ) : (
          <View style={styles.quizContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Ready to practice?</Text>
              <Text style={styles.summaryText}>
                {quizzes.length} practice {quizzes.length === 1 ? 'test' : 'tests'} available
              </Text>
              <Text style={styles.cacheInfo}>
                {quizType} cache • Valid for 10 minutes • Last updated: {getCacheAge()}
              </Text>
            </View>
            
            <View style={styles.quizList}>
              {quizzes.map((quiz, index) => renderQuizCard(quiz, index))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    marginRight: 16,
    marginTop: 4,
  },
  backArrow: {
    fontSize: 18,
    color: '#475569',
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
    paddingTop: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
    marginBottom: 2,
  },
  headerDetail: {
    fontSize: 14,
    color: '#64748b',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  messageContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconText: {
    fontSize: 28,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  quizContainer: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
    marginBottom: 8,
  },
  cacheInfo: {
    fontSize: 12,
    color: '#94a3b8',
  },
  quizList: {
    gap: 0,
  },
  quizCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  quizNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quizNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0369a1',
  },
  titleSection: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 4,
  },
  subjectText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  cardFooter: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  startButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  startArrow: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuizListScreen;