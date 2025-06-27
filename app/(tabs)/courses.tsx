import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../../redux/slices/courseSlice';
import { RootState, AppDispatch } from '../../redux/store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Add this import at the top

interface Course {
  id: string;
  title: string;
  thumbnail?: string;
  isEnrolled: boolean;
  completedLessons?: number;
  totalLessons?: number;
  instructor?: string;
}

const Courses = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter(); // Add this line
  const { all: courses, loading } = useSelector(
    (state: RootState) => state.courses
  );
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const isLandscape = screenWidth > screenHeight;
  const cardWidth = isLandscape ? screenWidth * 0.45 : screenWidth * 0.85;
  const thumbnailHeight = cardWidth * (9 / 16); // 16:9 aspect ratio

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const enrolledCourses = courses.filter((c: Course) => c.isEnrolled);
  const otherCourses = courses.filter((c: Course) => !c.isEnrolled);

  const calculateProgress = (course: Course): number => {
    const completed = course.completedLessons || 2;
    const total = course.totalLessons || 1;
    return total > 0 ? Math.floor((completed / total) * 100) : 0;
  };

  const renderCourse = ({ item }: { item: Course }) => {
    const progress = calculateProgress(item);
    const hasProgress = item.isEnrolled && progress > 0;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.card, { width: cardWidth }]}
        onPress={() => {
          if (item.isEnrolled) {
            router.push(`/components/courses/enrolledCourseSection?courseId=${item.id}`);
          } else {
             router.push(`/components/courses/courseSection?courseId=${item.id}`);
          }
        }}
      >
        <View style={styles.thumbnailContainer}>
          <Image
            source={{
              uri: item.thumbnail || 'https://placehold.co/600x400/222222/ffffff?text=No+Thumbnail',
            }}
            style={[styles.thumbnail, { height: thumbnailHeight }]}
            resizeMode="cover"
          />
          {hasProgress && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: '#4F46E5' }]} />
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text numberOfLines={2} style={styles.title}>
            {item.title || 'Untitled Course'}
          </Text>
          {item.instructor && (
            <Text numberOfLines={1} style={styles.instructor}>
              {item.instructor}
            </Text>
          )}
          {hasProgress && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <MaterialIcons name="schedule" size={16} color="#4F46E5" style={{ marginRight: 4 }} />
              <Text style={[styles.progressText, { lineHeight: 16 }]}>
                {item.completedLessons ?? 0}/{item.totalLessons ?? 0} lessons
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <FlatList
        data={[
          { title: 'My Learning', data: enrolledCourses },
          { title: 'Explore Courses', data: otherCourses },
        ]}
        renderItem={({ item }) => (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <FlatList
              horizontal
              data={item.data}
              renderItem={renderCourse}
              keyExtractor={(course: Course) => course.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {item.title === 'Continue Learning'
                      ? 'No active courses'
                      : 'No courses available'}
                  </Text>
                </View>
              }
            />
          </View>
        )}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.container}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F0F0F',
    marginLeft: 16,
    marginBottom: 12,
  },
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  card: {
    marginRight: 16,
    borderRadius: 8,
  },
  thumbnailContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E5E5E5',
  },
  thumbnail: {
    width: '100%',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBar: {
    height: '100%',
  },
  cardContent: {
    paddingTop: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F0F0F',
    lineHeight: 20,
  },
  instructor: {
    fontSize: 12,
    color: '#606060',
    marginTop: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#606060',
    marginTop: 4,
  },
  emptyContainer: {
    width: '100%',
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#909090',
  },
});

export default Courses;