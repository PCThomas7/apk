import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, Alert, Linking } from 'react-native';
import { StudentWelcomeBanner } from '../components/home/welcomeCard';
import UpcomingLessons from '../components/home/LessonComponent';
import PerformanceComponent from '../components/home/PerformanceComponent';
import courseServiceGet from ".././../services/courseServiceGet"
import { useRouter } from 'expo-router';
import updateService from '../../services/updateService'
import UpdateBanner from '../components/updateBanner';


// Define lesson type
interface Lesson {
  lessonId: string;
  title: string;
  scheduledFor: string;
  duration: string;
  chapterName: string;
  sectionName: string;
  courseName: string;
  courseId: string;
  sectionId: string;
  chapterId: string;
  status: 'live' | 'available' | 'upcoming';
}

const HomeScreen = () => {
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [version, setVersion] = useState(0);
  const [updateInfo, setUpdateInfo] = useState<null | { updateUrl: string }>(null);

  const fetchUpcomingLessons = useCallback(async () => {
    try {
      setIsLoading(true);
      setRefreshing(true);
      const lessons = await courseServiceGet.getEnrolledVideoLessons();
      setUpcomingLessons(lessons);
      setError(null);
    } catch (err) {
      console.error('Error fetching upcoming lessons:', err);
      setError('Failed to load lessons. Please try again later.');
      setUpcomingLessons([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    fetchUpcomingLessons();
  }, [fetchUpcomingLessons]);

  const checkUpdate = async () => {
    try {
      const response = await updateService.update(version);
      if (response.updateAvailable === true) {
        setUpdateInfo({ updateUrl: response.updateUrl });
      }
    } catch (error) {
      console.error('Update check failed:', error);
    }
  };

  useEffect(() => {
    fetchUpcomingLessons();
    checkUpdate()
  }, [fetchUpcomingLessons]);

  return (
    <ScrollView style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#4F46E5']}
          tintColor="#4F46E5"
        />
      }>
      {updateInfo && (
        <UpdateBanner
          updateUrl={updateInfo.updateUrl}
          onClose={() => setUpdateInfo(null)}
          duration={10000} // optional auto-dismiss
        />
      )}
      <StudentWelcomeBanner />
      <View style={[styles.section, { minHeight: 350 }]}>
        {upcomingLessons === null ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#007bff" />
          </View>
        ) : (
          <UpcomingLessons lessons={upcomingLessons} />
        )}
      </View>

      <PerformanceComponent onViewAnalytics={() => {
        router.push(`/components/analytics/AnalyticsList`);
      }} />
    </ScrollView>

  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
});

// const lessons: Lesson[] = [
//   {
//     lessonId: "1",
//     lessonTitle: 'Section Test1',
//     scheduledFor: "2025-06-12T10:00:00",
//     duration: "50m",
//     chapterTitle: "Repeater JEE 2025",
//     sectionTitle: "MATHS",
//     courseTitle: "FUNCTIONS MK",
//     courseId: "c1",
//     sectionId: "s1",
//     chapterId: "ch1"
//   },
//   {
//     lessonId: "2",
//     lessonTitle: 'Section Test2',
//     scheduledFor: "2025-06-12T12:00:00",
//     duration: "50m",
//     chapterTitle: "Repeater NEET 2025",
//     sectionTitle: "PHYSICS",
//     courseTitle: "FUNCTIONS MK",
//     courseId: "c2",
//     sectionId: "s2",
//     chapterId: "ch2"
//   },
//   {
//     lessonId: "3",
//     lessonTitle: 'Section Test3',
//     scheduledFor: "2025-06-12T14:00:00",
//     duration: "50m",
//     chapterTitle: "Repeater NEET 2025",
//     sectionTitle: "CHEMISTRY",
//     courseTitle: "FUNCTIONS MK",
//     courseId: "c3",
//     sectionId: "s3",
//     chapterId: "ch3"
//   },
//   {
//     lessonId: "4",
//     lessonTitle: 'Section Test4',
//     scheduledFor: "2025-06-12T14:00:00",
//     duration: "50m",
//     chapterTitle: "Repeater NEET 2025",
//     sectionTitle: "English",
//     courseTitle: "FUNCTIONS MK",
//     courseId: "c4",
//     sectionId: "s4",
//     chapterId: "ch4"
//   },
// ];
// useEffect(() => {
//   setUpcomingLessons(lessons)
// }, [])