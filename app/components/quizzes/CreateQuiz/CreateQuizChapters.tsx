import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Animated, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import courseServiceGet from '@/services/courseServiceGet';

type Params = {
  examType?: string;
  subjects?: string;
  count?: string;
};

type ChaptersMap = Record<string, string[]>;
type SelectionMap = Record<string, string[]>;

const CreateQuizChapters = () => {
  const router = useRouter();
  const { examType, subjects, count } = useLocalSearchParams<Params>();
  const parsedSubjects: string[] = subjects ? JSON.parse(subjects) : [];
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const [selectedSubject, setSelectedSubject] = useState<string | null>(parsedSubjects[0] || null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chaptersBySubject, setChaptersBySubject] = useState<ChaptersMap>({});
  const [selectedChapters, setSelectedChapters] = useState<SelectionMap>({});
  const [loading, setLoading] = useState(false);

  const toggleDropdown = () => {
    Animated.timing(rotateAnim, {
      toValue: dropdownOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setDropdownOpen(!dropdownOpen);
  };

  const fetchChapters = async (subject: string) => {
    try {
      setLoading(true);
      const chapters = await courseServiceGet.getChaptersForSubject(examType, subject);
      setChaptersBySubject(prev => ({ ...prev, [subject]: chapters }));
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectSubject = (subject: string) => {
    setSelectedSubject(subject);
    toggleDropdown();
    if (!chaptersBySubject[subject]) fetchChapters(subject);
  };

  const toggleChapter = (subject: string, chapter: string) => {
    setSelectedChapters(prev => {
      const current = prev[subject] || [];
      const updated = current.includes(chapter)
        ? current.filter(c => c !== chapter)
        : [...current, chapter];
      return { ...prev, [subject]: updated };
    });
  };

  const toggleSelectAll = (subject: string) => {
    const all = chaptersBySubject[subject] || [];
    const selected = selectedChapters[subject] || [];
    const isAll = selected.length === all.length;
    setSelectedChapters(prev => ({ ...prev, [subject]: isAll ? [] : all }));
  };

  useEffect(() => {
    if (selectedSubject && !chaptersBySubject[selectedSubject]) {
      fetchChapters(selectedSubject);
    }
  }, [selectedSubject]);

  const hasAnySelection = Object.values(selectedChapters).some(chapters => chapters.length > 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={router.back} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Quiz - Chapters</Text>
      </View>

      <View style={styles.container}>
        {/* Subject Dropdown */}
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity style={styles.dropdownHeader} onPress={toggleDropdown}>
            <View style={styles.dropdownHeaderContent}>
              <Ionicons name="book-outline" size={18} color="#4F46E5" />
              <Text style={styles.dropdownHeaderText} numberOfLines={1}>
                {selectedSubject || 'Select Subject'}
              </Text>
            </View>
            <Animated.View
              style={{
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg']
                  })
                }]
              }}
            >
              <Ionicons name="chevron-down" size={18} color="#4F46E5" />
            </Animated.View>
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.dropdownList}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {parsedSubjects.map(subject => (
                  <TouchableOpacity
                    key={subject}
                    style={[styles.dropdownItem, selectedSubject === subject && styles.dropdownItemSelected]}
                    onPress={() => selectSubject(subject)}
                  >
                    <Text style={styles.dropdownItemText}>{subject}</Text>
                    {selectedSubject === subject && (
                      <Ionicons name="checkmark" size={16} color="#4F46E5" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Chapter List */}
        <ScrollView style={styles.chapterContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
          ) : (
            selectedSubject &&
            chaptersBySubject[selectedSubject] && (
              <View>
                <TouchableOpacity onPress={() => toggleSelectAll(selectedSubject)} style={styles.selectAllButton}>
                  <Ionicons name="checkmark-done" size={16} color="#fff" />
                  <Text style={styles.selectAllText}>
                    {selectedChapters[selectedSubject]?.length === chaptersBySubject[selectedSubject].length
                      ? 'Unselect All'
                      : 'Select All'}
                  </Text>
                </TouchableOpacity>

                {chaptersBySubject[selectedSubject].map(chapter => {
                  const isSelected = selectedChapters[selectedSubject]?.includes(chapter);
                  return (
                    <TouchableOpacity
                      key={chapter}
                      style={[styles.chapterItem, isSelected && styles.chapterItemSelected]}
                      onPress={() => toggleChapter(selectedSubject, chapter)}
                    >
                      <Text style={styles.chapterText}>{chapter}</Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={18} color="#4F46E5" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )
          )}
        </ScrollView>

        {/* Selected Chapters */}
        <View style={styles.selectedWrapper}>
          {selectedSubject && selectedChapters[selectedSubject]?.length > 0 && (
            <>
              <Text style={styles.selectedTitle}>Selected Chapters:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectedScroll}>
                {selectedChapters[selectedSubject].map(chapter => (
                  <View key={chapter} style={styles.selectedChip}>
                    <Text style={styles.selectedChipText}>{chapter}</Text>
                    <TouchableOpacity onPress={() => toggleChapter(selectedSubject, chapter)}>
                      <Ionicons name="close-circle" size={16} color="#EF4444" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          {/* Next Button */}
          {hasAnySelection && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => {
                router.push({
                  pathname: '/components/quizzes/CreateQuiz/CreateQuizTopics',
                  params: {
                    selectedChapters: JSON.stringify(selectedChapters),
                    examType,
                    count: String(count),
                    subjects: subjects,
                  },
                });
              }}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 1,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
  },
  dropdownHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 10,
  },
  dropdownHeaderText: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 200,
    elevation: 2,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dropdownItemSelected: {
    backgroundColor: '#f0f4ff',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    marginRight: 10,
  },
  chapterContainer: {
    marginTop: 20,
  },
  chapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 6,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chapterItemSelected: {
    backgroundColor: '#e0edff',
    borderColor: '#4F46E5',
  },
  chapterText: {
    fontSize: 14,
    color: '#1f2937',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  selectAllText: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 6,
  },
  selectedWrapper: {
    marginTop: 20,
  },
  selectedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  selectedScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedChipText: {
    fontSize: 13,
    color: '#111827',
  },
  nextButton: {
    marginTop: 16,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CreateQuizChapters;
