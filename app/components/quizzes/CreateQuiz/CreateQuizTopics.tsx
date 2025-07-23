import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import courseServiceGet from '@/services/courseServiceGet';

const CreateQuizTopics = () => {
  const router = useRouter();
  const { selectedChapters, count, examType, subjects } = useLocalSearchParams();

  // Parse the parameters safely
  const parsedSelectedChapters: Record<string, string[]> = useMemo(() => {
    try {
      return selectedChapters ? JSON.parse(selectedChapters as string) : {};
    } catch {
      return {};
    }
  }, [selectedChapters]);

  const parsedSubjects: string[] = useMemo(() => {
    try {
      if (typeof subjects === 'string') {
        return JSON.parse(subjects);
      }
      return Object.keys(parsedSelectedChapters);
    } catch {
      return Object.keys(parsedSelectedChapters);
    }
  }, [subjects, parsedSelectedChapters]);

  // Prepare chapters in the required format
  const chapters: string[] = useMemo(() => {
    const result: string[] = [];

    parsedSubjects.forEach((subject: string) => {
      const chapterList = parsedSelectedChapters[subject] || [];
      chapterList.forEach((chapter: string) => {
        result.push(`${subject}:${chapter}`);
      });
    });
    return result;
  }, [parsedSubjects, parsedSelectedChapters]);

  const quizCount = Number(count) || 0;

  const [quizTitle, setQuizTitle] = useState('');
  const [selectedTime, setSelectedTime] = useState<number | null>(30);
  const [marksPerQuestion, setMarksPerQuestion] = useState('4');
  const [negativeMarks, setNegativeMarks] = useState('1');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Medium');
  const [distribution, setDistribution] = useState({ easy: 34, medium: 33, hard: 33 });
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const times = [15, 30, 60];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const updateDistribution = (type: 'easy' | 'medium' | 'hard', value: number) => {
    const others = Object.keys(distribution).filter(key => key !== type) as ('easy' | 'medium' | 'hard')[];
    const totalOthers = others.reduce((sum, key) => sum + distribution[key], 0);
    const remaining = 100 - value;
    const ratio1 = totalOthers > 0 ? distribution[others[0]] / totalOthers : 0.5;
    const ratio2 = 1 - ratio1;

    const newDist = {
      ...distribution,
      [type]: value,
      [others[0]]: Math.round(remaining * ratio1),
      [others[1]]: Math.round(remaining * ratio2),
    };

    setDistribution(newDist);
  };

  const handleCreateQuiz = async () => {
    try {
      if (quizCount >= 5) {
        Alert.alert('Limit Reached', 'You can only create up to 5 custom quizzes. Please delete some to create new ones.');
        return;
      }

      setIsLoading(true);

      const params = {
        examType,
        subject: parsedSubjects.join(','),
        chapter: chapters.map(ch => ch.split(':')[1]).join(','),
        topic: [''], // Empty string as per requirement
        title: quizTitle,
        duration: selectedTime,
        difficultyLevel: selectedDifficulty,
        questionDistribution: distribution,
        marksPerQuestion,
        negativeMarks,
      };

      const response = await courseServiceGet.createCustomQuiz(params);
      if (response.quiz._id) {
        router.replace({
          pathname: '/components/quizzes/QuizAttemptScreen',
          params: {
            contentId: response.quiz._id
          },
        });
      } else {
        Alert.alert(
          'Quiz Creation Failed',
          'Something went wrong while creating your quiz. Please try again later.'
        );
      }
    } catch (error: any) {
      console.error('Error creating quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = quizTitle && selectedTime && marksPerQuestion && negativeMarks && selectedDifficulty;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Custom Quiz</Text>
        </View>

        <View style={styles.content}>
          {/* Selected Subjects and Chapters Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Content</Text>
            <View style={styles.topicsContainer}>
              {parsedSubjects.map((subject) => (
                <View key={subject} style={styles.subjectBlock}>
                  <Text style={styles.subjectTitle}>{subject}</Text>
                  {parsedSelectedChapters[subject]?.map((chapter) => (
                    <Text key={chapter} style={styles.chapterTitle}>• {chapter}</Text>
                  ))}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Quiz Title</Text>
            <TextInput
              value={quizTitle}
              onChangeText={setQuizTitle}
              style={styles.input}
              placeholder="My Awesome Quiz"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Duration (minutes)</Text>
            <View style={styles.optionsRow}>
              {times.map(time => (
                <TouchableOpacity
                  key={time}
                  style={[styles.optionButton, selectedTime === time && styles.optionButtonSelected]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.optionText, selectedTime === time && styles.optionTextSelected]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Scoring</Text>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.subLabel}>Marks per Question</Text>
                <TextInput
                  value={marksPerQuestion}
                  onChangeText={setMarksPerQuestion}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholder="4"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.subLabel}>Negative Marks</Text>
                <TextInput
                  value={negativeMarks}
                  onChangeText={setNegativeMarks}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholder="1"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Difficulty Level</Text>
            <View style={styles.optionsRow}>
              {difficulties.map(level => (
                <TouchableOpacity
                  key={level}
                  style={[styles.optionButton, selectedDifficulty === level && styles.optionButtonSelected]}
                  onPress={() => setSelectedDifficulty(level)}
                >
                  <Text style={[styles.optionText, selectedDifficulty === level && styles.optionTextSelected]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Question Distribution</Text>
            {(['easy', 'medium', 'hard'] as const).map(level => (
              <View key={level} style={styles.sliderContainer}>
                <View style={styles.sliderHeader}>
                  <View style={styles.levelTag}>
                    <View style={[styles.levelDot, { backgroundColor: level === 'easy' ? '#22c55e' : level === 'medium' ? '#eab308' : '#ef4444' }]} />
                    <Text style={styles.levelText}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
                  </View>
                  <Text style={styles.percentValue}>{distribution[level]}%</Text>
                </View>
                <Slider
                  value={distribution[level]}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  minimumTrackTintColor={level === 'easy' ? '#22c55e' : level === 'medium' ? '#eab308' : '#ef4444'}
                  thumbTintColor={level === 'easy' ? '#22c55e' : level === 'medium' ? '#eab308' : '#ef4444'}
                  onValueChange={value => updateDistribution(level, value)}
                />
              </View>
            ))}
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total: {distribution.easy + distribution.medium + distribution.hard}%</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.createButton, !isFormValid && styles.disabledButton]}
            onPress={handleCreateQuiz}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Quiz</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingBottom: 40,
  },
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionButtonSelected: {
    backgroundColor: '#e0e7ff',
    borderColor: '#4F46E5',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  optionTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  percentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  totalContainer: {
    alignItems: 'flex-end',
    marginTop: -10,
  },
  totalText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  createButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  topicsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  subjectBlock: {
    marginBottom: 12,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  chapterBlock: {
    marginLeft: 8,
    marginBottom: 8,
  },
  chapterTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  topicsList: {
    marginLeft: 16,
  },
  topicItem: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateQuizTopics;