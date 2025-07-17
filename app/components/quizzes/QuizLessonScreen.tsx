import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import courseServiceGet from '@/services/courseServiceGet';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

type Lesson = {
  _id: string;
  title: string;
  isLocked: boolean;
  isScheduled: boolean;
  scheduledFor?: string;
};

const QuizLessonScreen = () => {
  const { lessonId, contentId, chapterId, courseId, sectionId } = useLocalSearchParams();
  const contentIdStr = Array.isArray(contentId) ? contentId[0] : contentId as string;
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const activeCourse = useSelector((state: RootState) => state.activeCourse.current);

  const fetchLesson = async () => {
    try {
      const response = await courseServiceGet.getLesson(lessonId);
      setLesson(response);
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, []);

  const handleBack = () => {
    router.back();
  };

const markLessonasComplete = async (contentIdStr: string) => {
  try {
    const response = await courseServiceGet.markLessonCompleted(lessonId, {
      courseId: courseId,
      sectionId: sectionId,
      chapterId: chapterId
    });
  } catch (error) {
    console.error('Completion error:', error);
  }

  router.push(`/components/quizzes/QuizAttemptScreen?contentId=${contentIdStr}`);
};


  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lesson?.title}</Text>
      </View>

      <View style={styles.container}>
        {/* Introductory Section */}
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>
            {lesson?.isScheduled
              ? "⏳ Upcoming lesson"
              : lesson?.isLocked
                ? "🔒 Premium Quiz Content"
                : "🧠 Knowledge Check"}
          </Text>

          <Text style={styles.introText}>
            {lesson?.isScheduled
              ? "This lesson will help reinforce your learning. It'll be available soon as part of your course schedule."
              : lesson?.isLocked
                ? "This lesson is part of our premium content. Unlock it to test your knowledge and track your progress."
                : "This lesson will help reinforce what you've learned. You'll have limited time to complete it."}
          </Text>
        </View>


        {/* Main Card Content */}
        {lesson?.isScheduled ? (
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="time-outline" size={48} color="#3B82F6" />
            </View>
            <Text style={styles.cardTitle}>Quiz Coming Soon</Text>
            <Text style={styles.cardDescription}>
              {lesson.scheduledFor
                ? `Available on ${new Date(lesson.scheduledFor).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}`
                : "This quiz will be available soon as part of your learning path."}

            </Text>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleBack}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Back to Lessons</Text>
            </TouchableOpacity>
          </View>
        ) : lesson?.isLocked ? (
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={48} color="#F59E0B" />
            </View>
            <Text style={styles.cardTitle}>Premium Content Locked</Text>
            <Text style={styles.cardDescription}>
              Enroll in the full course to access this quiz and all other premium content.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => router.push(`/components/courses/courseSection?courseId=${activeCourse?.id}`)}
            >
              <Text style={styles.buttonText}>Enroll Now</Text>
              <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="play-circle" size={48} color="#10B981" />
            </View>
            <Text style={styles.cardTitle}>Ready to Begin?</Text>
            <Text style={styles.cardDescription}>
              This quiz contains multiple-choice questions. You'll have one attempt and limited time.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => markLessonasComplete(contentIdStr)}
            >
              <Text style={styles.buttonText}>Start Quiz Now</Text>
              <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>
        )}

        {/* Footer Section */}
        <Text style={styles.footerText}>
          {lesson?.isScheduled
            ? "Scheduled quizzes help with long-term knowledge retention."
            : lesson?.isLocked
              ? "Premium members score 20% higher on average!"
              : "Tip: Read each question carefully before answering."}
        </Text>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
  },
  introContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#4B5563',
  },
  buttonIcon: {
    marginLeft: 8,
  },

  footerText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
    paddingHorizontal: 16,
  },
});

export default QuizLessonScreen;