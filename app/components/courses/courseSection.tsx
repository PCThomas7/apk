import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import courseServiceGet from '@/services/courseServiceGet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../header';

interface Section {
  _id: string;
  title: string;
  description: string;
  order: number;
  chapters?: Chapter[];
}

interface Chapter {
  _id: string;
  title: string;
  description: string;
  order: number;
  lessons?: Lesson[];
}

interface Lesson {
  _id: string;
  title: string;
  duration?: number;
}

const CourseSection = () => {
  const { courseId } = useLocalSearchParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await courseServiceGet.getCourse(courseId);
        setCourse(response);
        // Initialize all sections as collapsed
        const initialSections: Record<string, boolean> = {};
        response.sections?.forEach((section: Section) => {
          initialSections[section._id] = false;
        });
        setExpandedSections(initialSections);
      } catch (error) {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

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
        <AppHeader screenTitle={course.title} onBackPress={() => router.back()} />

        <ScrollView
          contentContainerStyle={[styles.container, { flexGrow: 1, paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={{ uri: course.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />

          <Text style={styles.courseTitle}>{course.title}</Text>
          {course.price > 0 && (
            <Text style={styles.price}>Price: ₹{course.price}</Text>
          )}

          <Text style={styles.sectionHeader}>Course Content</Text>

          {course.sections?.map((section: Section) => (
            <View key={section._id} style={styles.sectionContainer}>
              <TouchableOpacity
                onPress={() => toggleSection(section._id)}
                style={styles.sectionHeaderButton}
                activeOpacity={0.7}
              >
                <View style={styles.sectionTitleContainer}>
                  <Ionicons
                    name={expandedSections[section._id] ? "chevron-down" : "chevron-forward"}
                    size={20}
                    color="#6B7280"
                  />
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                <Text style={styles.sectionInfo}>
                  {section.chapters?.length || 0} chapters
                </Text>
              </TouchableOpacity>

              {expandedSections[section._id] && section.chapters && (
                <View style={styles.chapterList}>
                  {section.chapters.map((chapter: Chapter) => (
                    <View key={chapter._id} style={styles.chapterContainer}>
                      <TouchableOpacity
                        onPress={() => toggleChapter(chapter._id)}
                        style={styles.chapterHeaderButton}
                        activeOpacity={0.7}
                      >
                        <View style={styles.chapterTitleContainer}>
                          <Ionicons
                            name={expandedChapters[chapter._id] ? "chevron-down" : "chevron-forward"}
                            size={18}
                            color="#6B7280"
                          />
                          <Text style={styles.chapterTitle}>{chapter.title}</Text>
                        </View>
                        <Text style={styles.chapterInfo}>
                          {chapter.lessons?.length || 0} lessons
                        </Text>
                      </TouchableOpacity>

                      {expandedChapters[chapter._id] && chapter.lessons && (
                        <View style={styles.lessonList}>
                          {chapter.lessons.map((lesson: Lesson) => (
                            <TouchableOpacity
                              key={lesson._id}
                              style={styles.lessonItem}
                              activeOpacity={0.7}
                            >
                              <Ionicons
                                name="play-circle"
                                size={16}
                                color="#4F46E5"
                                style={styles.lessonIcon}
                              />
                              <Text style={styles.lessonTitle}>{lesson.title}</Text>
                              {lesson.duration && (
                                <Text style={styles.lessonDuration}>
                                  {formatDuration(lesson.duration)}
                                </Text>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => alert('Buy Now pressed!')}
          >
            <Text style={styles.buyButtonText}>BUY NOW</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    padding: 16
  },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 16
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827'
  },
  price: {
    fontSize: 16,
    color: '#4F46E5',
    marginBottom: 16,
    fontWeight: '500'
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827'
  },
  sectionContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  sectionHeaderButton: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 8
  },
  sectionInfo: {
    fontSize: 14,
    color: '#6B7280'
  },
  chapterList: {
    overflow: 'hidden'
  },
  chapterContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff'
  },
  chapterHeaderButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chapterTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  chapterTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8
  },
  chapterInfo: {
    fontSize: 13,
    color: '#9CA3AF'
  },
  lessonList: {
    backgroundColor: '#f9fafb',
    paddingLeft: 44,
    paddingRight: 16
  },
  lessonItem: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  lessonIcon: {
    marginRight: 12
  },
  lessonTitle: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1
  },
  lessonDuration: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8
  },
  buyButton: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default CourseSection;