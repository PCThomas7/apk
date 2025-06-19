import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchChaptersStart,
  fetchChaptersSuccess,
  fetchChaptersFailure,
  selectChapters,
  selectChapterState,
  isChapterCacheValid,
} from '@/redux/slices/chapterSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import courseServiceGet from '@/services/courseServiceGet';
import ResponsiveGridSkeleton from '../skeltons/Skelton';
import { Ionicons } from '@expo/vector-icons';


type ChapterParams = {
  quizType: string;
  subject: string;
  examType: string;
  courseId: string;
};

const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

const ChapterSelectionScreen = () => {
  const { quizType, subject, examType, courseId } = useLocalSearchParams<ChapterParams>();
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Create a unique cache key that includes all relevant parameters
  const key = useMemo(
    () => `CHAPTERS_${quizType}_${subject}_${examType}_${courseId}`.toLowerCase(),
    [quizType, subject, examType, courseId]
  );

  const screenTitle = useMemo(() => {
    switch (quizType) {
      case 'DPP': return 'Daily Practice Problems';
      case 'Short Exam': return 'Short Examinations';
      default: return 'Practice Tests';
    }
  }, [quizType]);

  const chapters = useAppSelector((state) => selectChapters(state, key));
  const chapterState = useAppSelector((state) => selectChapterState(state, key));
  // const cacheValid = useAppSelector((state) => 
  //   isChapterCacheValid(state, key, CACHE_EXPIRY)
  // );

  const currentTime = Date.now(); // ⏱️ Get it outside
  const cacheValid = useAppSelector((state) =>
    isChapterCacheValid(state, key, CACHE_EXPIRY, currentTime)
  );

  const { isLoading, error } = chapterState;

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        dispatch(fetchChaptersStart({ key }));

        const response = await courseServiceGet.getDppChapters(quizType, subject, examType);

        // Transform server data to proper structure
        const serverChapters = response.chapters || []; // Changed from uniqueChapters to chapters
        const formattedChapters = serverChapters.map((item: any, index: number) => ({
          id: `${key}_${index}`,
          name: item.chapter || `Chapter ${index + 1}`,
        }));
        dispatch(fetchChaptersSuccess({ key, data: formattedChapters }));
      } catch (err) {
        console.error('Fetch error:', err); // Debug log
        dispatch(fetchChaptersFailure({ key, error: 'Failed to load chapters' }));
      }
    };

    if (!cacheValid && !isLoading) {
      fetchChapters();
    }
  }, [cacheValid, dispatch, key, quizType, subject, examType, courseId]);

  const handleViewQuizzes = (chapter: string) => {
    // Navigation to quizzes screen
    router.push({
      pathname: '/components/quizzes/QuizListScreen',
      params: { quizType, subject, chapter, examType, },
    });
  };
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (isLoading && chapters.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: 30 }]}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{subject}</Text>
          <Text style={styles.subHeaderText}>Select a chapter to begin</Text>
        </View>
        <ResponsiveGridSkeleton />
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

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => dispatch(fetchChaptersStart({ key }))}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.chaptersContainer}>
            {Array.isArray(chapters) && chapters.length > 0 ? (
              chapters.map((chapter) => (
                <View key={chapter.id} style={styles.chapterCard}>
                  <View style={styles.chapterInfo}>
                    <Text style={styles.chapterName}>
                      {chapter.name || 'Unnamed Chapter'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.quizButton}
                    onPress={() => handleViewQuizzes(chapter.name)}
                  >
                    <Text style={styles.quizButtonText}>View Quizzes</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noChaptersText}>No chapters available</Text>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
    color: '#111827',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#e2e8f0',
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  chaptersContainer: {
    padding: 16,
  },
  chapterCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chapterInfo: {
    marginBottom: 12,
  },
  chapterName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  quizButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quizButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  noChaptersText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#64748b',
  },
});

export default ChapterSelectionScreen;