// import React, { useEffect, useState, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   ScrollView
// } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
// import courseServiceGet from '../../../services/courseServiceGet';
// import { setQuizzes, selectQuizCache, selectIsCacheValid } from '../../../redux/slices/quizSlice';
// import ResponsiveSkeleton from '../skeltons/Skelton';
// import { Ionicons } from '@expo/vector-icons';
// import { SafeAreaView } from 'react-native-safe-area-context';

// interface Quiz {
//   _id: string;
//   title: string;
//   quizType: string;
//   duration?: string;
//   content: string;
// }

// const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// const QuizListScreen = () => {
//   const { quizType } = useLocalSearchParams<{ quizType: string }>();
//   const { examType } = useLocalSearchParams<{ examType: string }>();
//   const { subject } = useLocalSearchParams<{ subject: string }>();
//   const { chapter } = useLocalSearchParams<{ chapter: string }>();
//   const router = useRouter();
//   const dispatch = useAppDispatch();

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [quizzes, setQuizzesState] = useState<Quiz[]>([]);

//   const currentRoute = 'quiz-list'; // No need for useMemo for a constant

//   // Get cached quizzes and check validity
//   const cachedData = useAppSelector((state) =>
//     selectQuizCache(state, quizType || '', currentRoute)
//   );
//   const isCacheValid = useAppSelector((state) =>
//     selectIsCacheValid(state, quizType || '', CACHE_DURATION, currentRoute)
//   );

//   const screenTitle = useMemo(() => {
//     switch (quizType) {
//       case 'DPP': return 'Daily Practice Problems';
//       case 'Short Exam': return 'Short Examinations';
//       case 'Mock Exam': return 'Mock Examinations';
//       default: return 'Practice Tests';
//     }
//   }, [quizType]);

//   const fetchQuizzes = useCallback(async () => {
//     if (!quizType) return;

//     try {
//       setLoading(true);
//       setError('');

//       const response = await courseServiceGet.getDppQuizzes(quizType);
//       const fetchedQuizzes = response.quizzes || [];

//       setQuizzesState(fetchedQuizzes);

//       // Store in Redux cache
//       dispatch(setQuizzes({
//         quizType,
//         quizzes: fetchedQuizzes.map((quiz: Quiz) => ({
//           id: quiz._id,
//           title: quiz.title,
//           quizType: quiz.quizType,
//           duration: quiz.duration,
//           content: quiz.content
//         })),
//         route: currentRoute
//       }));
//     } catch (err) {
//       console.error('Error fetching quizzes:', err);
//       setError('Unable to load quizzes. Please check your connection and try again.');
//     } finally {
//       setLoading(false);
//     }
//   }, [quizType, currentRoute, dispatch]);

//   useEffect(() => {
//     if (cachedData?.quizzes && isCacheValid) {
//       // Convert cached data to Quiz format
//       const cachedQuizzes = cachedData.quizzes.map(quiz => ({
//         _id: quiz.id,
//         title: quiz.title,
//         quizType: quiz.quizType,
//         duration: quiz.duration,
//         content: quiz.content
//       }));
//       setQuizzesState(cachedQuizzes);
//     } else {
//       fetchQuizzes();
//     }
//   }, [cachedData, isCacheValid, fetchQuizzes]);

//   const handleTakeQuiz = useCallback((contentId: string) => {
//     // router.push(`/student/quizzes/take/${contentId}`);
//   }, [router]);

//   const handleBack = useCallback(() => {
//     router.back();
//   }, [router]);

//   const renderQuizCard = useCallback((quiz: Quiz) => (
//     <TouchableOpacity
//       key={quiz._id}
//       style={styles.quizCard}
//       onPress={() => handleTakeQuiz(quiz.content)}
//       activeOpacity={0.9}
//     >
//       <View style={styles.cardHeader}>
//         <View style={styles.titleRow}>
//           <Text style={styles.quizTitle} numberOfLines={2}>{quiz.title}</Text>
//           {quiz.quizType === 'Mock Exam' && (
//             <View style={styles.quizTypeBadge}>
//               <Text style={styles.quizTypeText}>Mock Exam</Text>
//             </View>
//           )}
//         </View>
//       </View>

//       <View style={styles.detailsContainer}>
//         {quiz.duration && (
//           <View style={styles.detailItem}>
//             <Ionicons name="time-outline" size={16} color="#6b7280" />
//             <Text style={styles.detailText}>{quiz.duration} min</Text>
//           </View>
//         )}
//       </View>

//       <View style={styles.startButton}>
//         <Text style={styles.startButtonText}>Start Quiz</Text>
//         <Ionicons name="arrow-forward" size={16} color="white" />
//       </View>
//     </TouchableOpacity>
//   ), [handleTakeQuiz]);

//   if (loading) {
//     return (
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={handleBack} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={22} color="#4F46E5" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>{screenTitle}</Text>
//         </View>
//         <ScrollView style={styles.content}>
//           <ResponsiveSkeleton />
//         </ScrollView>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom', 'left', 'right']}>
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={handleBack} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={22} color="#4F46E5" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>{screenTitle}</Text>
//         </View>

//         <ScrollView
//           style={styles.content}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.scrollContent}
//         >
//           {error ? (
//             <View style={styles.errorContainer}>
//               <View style={styles.errorIcon}>
//                 <Ionicons name="warning" size={24} color="#dc2626" />
//               </View>
//               <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
//               <Text style={styles.errorText}>{error}</Text>
//               <TouchableOpacity
//                 style={styles.retryButton}
//                 onPress={fetchQuizzes}
//               >
//                 <Text style={styles.retryButtonText}>Try Again</Text>
//               </TouchableOpacity>
//             </View>
//           ) : quizzes.length === 0 ? (
//             <View style={styles.emptyContainer}>
//               <Ionicons name="book-outline" size={48} color="#9ca3af" />
//               <Text style={styles.emptyTitle}>No quizzes available</Text>
//               <Text style={styles.emptyText}>
//                 No {quizType?.toLowerCase()} found at the moment.
//               </Text>
//             </View>
//           ) : (
//             <View style={styles.quizList}>
//               {quizzes.map(renderQuizCard)}
//             </View>
//           )}
//         </ScrollView>
//       </View>
//     </SafeAreaView>

//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F3F4F6',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: 'white',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e5e7eb',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#f3f4f6',
//     marginRight: 12,
//     justifyContent: 'center',
//     alignItems: 'center', // Center icon horizontally
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   content: {
//     flex: 1,
//   },
//   scrollContent: {
//     padding: 16,
//   },
//   quizList: {
//     gap: 16,
//   },
//   quizCard: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 1,
//   },
//   cardHeader: {
//     marginBottom: 12,
//   },
//   titleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   quizTitle: {
//     flex: 1,
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   quizTypeBadge: {
//     backgroundColor: '#e0f2fe',
//     borderRadius: 4,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     marginLeft: 8,
//   },
//   quizTypeText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#0369a1',
//   },
//   detailsContainer: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
//   detailItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   detailText: {
//     marginLeft: 4,
//     fontSize: 14,
//     color: '#6b7280',
//   },
//   startButton: {
//     backgroundColor: '#4f46e5',
//     borderRadius: 8,
//     padding: 12,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   startButtonText: {
//     color: 'white',
//     fontWeight: '600',
//     marginRight: 8,
//   },
//   errorContainer: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 24,
//     alignItems: 'center',
//     marginTop: 40,
//   },
//   errorIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#fee2e2',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   errorTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1e293b',
//     marginBottom: 8,
//   },
//   errorText: {
//     fontSize: 15,
//     color: '#64748b',
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   retryButton: {
//     backgroundColor: '#4f46e5',
//     borderRadius: 8,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//   },
//   retryButtonText: {
//     color: 'white',
//     fontWeight: '600',
//   },
//   emptyContainer: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 24,
//     alignItems: 'center',
//     marginTop: 40,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1e293b',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyText: {
//     fontSize: 15,
//     color: '#64748b',
//     textAlign: 'center',
//   },
// });

// export default QuizListScreen;


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

interface Quiz {
  _id: string;
  title: string;
  quizType: string;
  duration?: string;
  content: string;
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
          content: quiz.content
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

  const handleBack = useCallback(() => {
    router.back();
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

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => handleTakeQuiz(quiz.content)}
          activeOpacity={0.9}
        >
          <Text style={styles.startButtonText}>Start Quiz</Text>
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
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{screenTitle}</Text>
        </View>
        <ScrollView style={styles.content}>
          <ResponsiveSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{screenTitle}</Text>
        </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center', // Center icon horizontally
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937'
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