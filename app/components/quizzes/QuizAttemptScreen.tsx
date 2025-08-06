// QuizAttemptScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuiz, startQuiz } from '../../../redux/slices/quizAttemptSlice';
import { RootState, AppDispatch } from '../../../redux/store';

import InstructionsScreen from './instruction';
import QuizParticipationScreen from './QuizParticipationScreen';
import ResponsiveGridSkeleton from '../skeltons/Skelton';

const QuizAttemptScreen: React.FC = () => {
  const { contentId } = useLocalSearchParams<{ contentId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, currentQuiz } = useSelector((state: RootState) => state.quiz);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (contentId) {
      dispatch(fetchQuiz(contentId));
    }
  }, [contentId, dispatch]);

  const handleStartQuiz = () => {
    if (!currentQuiz) {
      console.error('Quiz not loaded');
      return;
    }

    // Calculate total questions count
    const totalQuestions = currentQuiz.sections.reduce(
      (sum, section) => sum + section.questions.length,
      0
    );

    if (totalQuestions === 0) {
      console.error('Quiz has no questions');
      return;
    }

    dispatch(startQuiz(currentQuiz));
    setShowInstructions(false);
  };

  if (loading) return <ResponsiveGridSkeleton />;

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => contentId && dispatch(fetchQuiz(contentId))}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!currentQuiz) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>No quiz data available</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => contentId && dispatch(fetchQuiz(contentId))}
        >
          <Text style={styles.retryButtonText}>Load Quiz</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Calculate total questions count for instructions
  const totalQuestions = currentQuiz.sections.reduce(
    (sum, section) => sum + section.questions.length,
    0
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {showInstructions ? (
        <InstructionsScreen 
          timeLimit={currentQuiz.timeLimit} 
          questionsCount={totalQuestions} 
          onStartQuiz={handleStartQuiz}
        />
      ) : (
        <QuizParticipationScreen/>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    padding: 15,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuizAttemptScreen;