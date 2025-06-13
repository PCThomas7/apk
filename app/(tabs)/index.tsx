import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { StudentWelcomeBanner } from '../components/home/welcomeCard';
import UpcomingLessons from '../components/home/LessonComponent';
import PerformanceComponent from '../components/home/PerformanceComponent';
import courseServiceGet from ".././../services/courseServiceGet"

// Define lesson type
interface Lesson {
  lessonId: string;
  lessonTitle: string;
  scheduledFor: string;
  duration: string;
  chapterTitle: string;
  sectionTitle: string;
  courseTitle: string;
  courseId: string;
  sectionId: string;
  chapterId: string;
}

const HomeScreen = () => {
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // const fetchUpcomingLessons = useCallback(async () => {
  //   try {
  //     setIsLoading(true);
  //     const lessons = await courseServiceGet.getUpcomingLessons();
  //     setUpcomingLessons(lessons);
  //     setError(null);
  //   } catch (err) {
  //     console.error('Error fetching upcoming lessons:', err);
  //     setError('Failed to load lessons. Please try again later.');
  //     setUpcomingLessons([]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   fetchUpcomingLessons();
  // }, [fetchUpcomingLessons]);



  const lessons: Lesson[] = [
    {
      lessonId: "1",
      lessonTitle: 'Section Test1',
      scheduledFor: "2025-06-12T10:00:00",
      duration: "50m",
      chapterTitle: "Repeater JEE 2025",
      sectionTitle: "MATHS",
      courseTitle: "FUNCTIONS MK",
      courseId: "c1",
      sectionId: "s1",
      chapterId: "ch1"
    },
    {
      lessonId: "2",
      lessonTitle: 'Section Test2',
      scheduledFor: "2025-06-12T12:00:00",
      duration: "50m",
      chapterTitle: "Repeater NEET 2025",
      sectionTitle: "PHYSICS",
      courseTitle: "FUNCTIONS MK",
      courseId: "c2",
      sectionId: "s2",
      chapterId: "ch2"
    },
    {
      lessonId: "3",
      lessonTitle: 'Section Test3',
      scheduledFor: "2025-06-12T14:00:00",
      duration: "50m",
      chapterTitle: "Repeater NEET 2025",
      sectionTitle: "CHEMISTRY",
      courseTitle: "FUNCTIONS MK",
      courseId: "c3",
      sectionId: "s3",
      chapterId: "ch3"
    },
    {
      lessonId: "4",
      lessonTitle: 'Section Test4',
      scheduledFor: "2025-06-12T14:00:00",
      duration: "50m",
      chapterTitle: "Repeater NEET 2025",
      sectionTitle: "English",
      courseTitle: "FUNCTIONS MK",
      courseId: "c4",
      sectionId: "s4",
      chapterId: "ch4"
    },
  ];
  useEffect(() => {
    setUpcomingLessons(lessons)
  }, [])

  return (
    <ScrollView style={styles.container}>
      <StudentWelcomeBanner />
      <View style={[styles.section, { minHeight: 200 }]}>
        {upcomingLessons === null ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#007bff" />
          </View>
        ) : (
          <UpcomingLessons lessons={upcomingLessons} />
        )}
      </View>

      <PerformanceComponent />
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



//   const lessons: Lesson[] = [
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
// useEffect(() =>{
//   setUpcomingLessons(lessons)
// },[])