import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import courseServiceGet from '../../../services/courseServiceGet';
import ResponsiveGridSkeleton from '../skeltons/Skelton';
import AppHeader from '../header';

const CourseChapters = () => {
  const router = useRouter();
  const { sectionId, courseId } = useLocalSearchParams<{ sectionId: string, courseId: string }>();
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        if (sectionId) {
          const data = await courseServiceGet.getSectionChapters(sectionId);
          setChapters(data.chapters || []);
        }
      } catch (err) {
        setChapters([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChapters();
  }, [sectionId]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <AppHeader screenTitle='Course Chapters' onBackPress={() => router.back()} />
      <View style={styles.container}>
        {loading ? (
          <ResponsiveGridSkeleton />
        ) : chapters.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="book-off-outline" size={60} color="#A5B4FC" />
            <Text style={styles.emptyText}>No chapters found</Text>
          </View>
        ) : (
          <FlatList
            data={chapters}
            keyExtractor={item => item._id || item.id}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.chapterCard}
                activeOpacity={0.7}
                onPress={() => router.push(`/components/courses/courseLesson?chapterId=${item._id || item.id}&courseId=${courseId}&sectionId${sectionId}`)}
              >
                <View style={styles.chapterInfo}>
                  <Text style={styles.chapterTitle}>
                    {index + 1}. {item.title}
                  </Text>
                  {item.description ? (
                    <Text style={styles.chapterDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#A5B4FC',
    marginTop: 16,
    fontWeight: '500',
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  chapterIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    color: '#3730A3',
    fontWeight: '400',
    marginBottom: 4,
  },
  chapterDesc: {
    fontSize: 13,
    color: '#64748B',
  },
});

export default CourseChapters;