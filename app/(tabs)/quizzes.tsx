import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, ScrollView } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const isLandscape = width > height;

export default function QuizzScreen() {
  const router = useRouter();

  const handleQuizTypeSelect = async (quizType: string) => {
    if (quizType === 'Mock Exam') {
      // Navigate directly to QuizListScreen for Mock Exam
      router.push({
        pathname: '/components/quizzes/QuizListScreen',
        params: { quizType: 'Mock Exam' }, // Note the space to match your API
      });
    } else {
      // Navigate to Subject Selection Screen for other quiz types
      router.push({
        pathname: '/components/quizzes/SubjectSelectionScreen',
        params: { quizType },
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Quizzes</Text>
        <Text style={styles.subtitle}>Ace your exams with targeted practice!</Text>
      </View>

      <View style={[styles.buttonContainer]}>
        {quizOptions.map(({ title, description, color, quizType }, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.quizButton, { backgroundColor: color }]}
            activeOpacity={0.85}
            onPress={() => handleQuizTypeSelect(quizType)}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.quizButtonText}>{title}</Text>
              <Text style={styles.buttonDescription}>{description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>📌 Select a quiz type and start your prep journey</Text>
      </View>
    </ScrollView>
  );
}

const quizOptions = [
  { title: 'DPP Quizzes', description: 'Daily Practice Problems', color: '#2a9d8f', quizType: "DPP" },
  { title: 'Short Exam Quizzes', description: 'Quick assessments', color: '#e76f51', quizType: "Short Exam" },
  { title: 'Mock Exam Quizzes', description: 'Full exam simulation', color: '#264653', quizType: "Mock Exam" },
  { title: 'Create Practice Quizzes', description: 'Build your own quizzes', color: '#f4a261', quizType: "" },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffefc',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: isLandscape ? 26 : 32,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: isLandscape ? 14 : 16,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    gap: 18,
  },
  buttonContainerLandscape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quizButton: {
    minHeight: 100,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  buttonContent: {
    alignItems: 'center',
  },
  quizButtonText: {
    fontSize: isLandscape ? 15 : 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: isLandscape ? 11 : 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 18,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
