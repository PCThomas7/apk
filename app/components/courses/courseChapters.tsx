import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import courseServiceGet from '../../../services/courseServiceGet';
import ResponsiveGridSkeleton from '../skeltons/Skelton';

const CourseChapters = () => {
  const router = useRouter();
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
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

  const handleBack = () => router.back();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Chapters</Text>
      </View>
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
                onPress={() => router.push(`/components/courses/courseLesson?chapterId=${item._id || item.id}`)}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
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