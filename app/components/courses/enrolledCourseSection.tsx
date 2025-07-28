import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import courseServiceGet from '@/services/courseServiceGet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveGridSkeleton from '../skeltons/Skelton';
import AppHeader from '../header';

const EnrolledCourseSection = () => {
  const { courseId, initialCourse } = useLocalSearchParams<{ courseId: string; initialCourse?: any }>();
  const router = useRouter();
  const [course, setCourse] = useState<any>(initialCourse || null);
  const [loading, setLoading] = useState(!initialCourse);

  useEffect(() => {
    let isMounted = true;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await courseServiceGet.getCourseV2(courseId);
        if (isMounted) setCourse(response);
      } catch (error) {
        if (isMounted) setCourse(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (!initialCourse) {
      fetchCourse();
    }

    return () => {
      isMounted = false;
    };
  }, [courseId]);


  if (loading) return <ResponsiveGridSkeleton />;

  if (!course) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Failed to load course data</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <AppHeader screenTitle={course.title} onBackPress={() => router.back()} />

        {/* Analytics Button */}
        <TouchableOpacity
          style={styles.analyticsButton}
          activeOpacity={0.85}
          onPress={() => router.push(`/components/courses/courseAnalytics?courseId=${courseId}`)}
        >
          <View style={styles.analyticsContent}>
            <Ionicons name="bar-chart" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.analyticsText}>Course Analytics</Text>
          </View>
        </TouchableOpacity>

        {/* Sections List */}
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.sectionHeader}>Sections</Text>
          {course.sections?.map((section: any, idx: number) => (
            <TouchableOpacity
              key={section._id}
              style={[styles.sectionContainer, { backgroundColor: '#E0E7FF' }]}
              onPress={() => router.push(`/components/courses/courseChapters?courseId=${courseId}&sectionId=${section._id}`)} activeOpacity={0.7}
            >
              <Text style={[styles.sectionTitle, { color: '#3730A3', fontWeight: '400' }]}>
                {String(idx + 1).padStart(2, '0')}. {section.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  analyticsButton: {
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  analyticsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
  },
  analyticsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
  },
  sectionContainer: {
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
  },
});

export default EnrolledCourseSection;
