import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store';
import KatexRendered from './KatexRenderer';
import { setSolutionSelectedQuestionId } from '../../../redux/slices/quizAttemptSlice';
import courseServiceGet from '@/services/courseServiceGet';

const QuizSolutionScreen = React.memo(() => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { index, answers } = useLocalSearchParams<{ index?: string; answers?: string }>();
  const quiz = useSelector((state: RootState) => state.quiz.currentQuiz);
  const solutionSelectedQuestionId = useSelector((state: RootState) => state.solution.selectedQuestionId);
  const [currentQuestionBookmarkStatus, setcurrentQuestionBookmarkStatus] = useState(false);

  // Memoized parsed answers
  const parsedAnswers = useMemo(() => {
    try {
      return answers ? JSON.parse(answers) : {};
    } catch {
      return {};
    }
  }, [answers]);

  // Memoized flattened questions
  const allQuestions = useMemo(() =>
    quiz?.sections?.flatMap((section) =>
      section.questions.map((q) => ({ ...q, sectionName: section.name }))
    ) || [],
    [quiz]
  );

  // Memoized initial index calculation
  const initialIndex = useMemo(() => {
    if (solutionSelectedQuestionId) {
      const foundIdx = allQuestions.findIndex(q => q.id === solutionSelectedQuestionId);
      return foundIdx !== -1 ? foundIdx : 0;
    }
    return index ? parseInt(index, 10) || 0 : 0;
  }, [solutionSelectedQuestionId, allQuestions, index]);

  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const currentQuestion = allQuestions[currentIndex];

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      const response = await courseServiceGet.checkBookmarkStatus(currentQuestion.id);
      setcurrentQuestionBookmarkStatus(response);
    };

    if (currentQuestion?.id) {
      checkBookmarkStatus();
    }
  }, [currentQuestion?.id]);

  const toggleQuestionBookmark = async () => {
    try {
      if (!currentQuestionBookmarkStatus) {
        await courseServiceGet.bookmarkQuestion(currentQuestion.id);
        setcurrentQuestionBookmarkStatus(true); // Optimistic update
      } else {
        await courseServiceGet.removeBookmark(currentQuestion.id);
        setcurrentQuestionBookmarkStatus(false); // Optimistic update
      }
    } catch (error) {
      console.error('Bookmark toggle error:', error);
    }
  };

  // Effect to handle question navigation from redux
  React.useEffect(() => {
    if (solutionSelectedQuestionId) {
      const foundIdx = allQuestions.findIndex(q => q.id === solutionSelectedQuestionId);
      if (foundIdx !== -1 && foundIdx !== currentIndex) {
        setCurrentIndex(foundIdx);
        dispatch(setSolutionSelectedQuestionId(undefined));
      }
    }
  }, [solutionSelectedQuestionId, allQuestions, currentIndex, dispatch]);

  // Memoized current question data
  const { userAnswer, correctOption } = useMemo(() => {
    const userAnswerArr = parsedAnswers[currentQuestion?.id] || [];
    return {
      userAnswer: userAnswerArr[0],
      correctOption: currentQuestion?.options?.find((opt) => opt.isCorrect)
    };
  }, [parsedAnswers, currentQuestion]);

  // Memoized navigation handlers
  const handleBack = useCallback(() => router.back(), [router]);
  const handlePrev = useCallback(() =>
    setCurrentIndex(prev => Math.max(prev - 1, 0)), []);
  const handleNext = useCallback(() =>
    setCurrentIndex(prev => Math.min(prev + 1, allQuestions.length - 1)), [allQuestions.length]);

  const handleQuestionList = useCallback(() =>
    router.push({
      pathname: '/components/quizzes/ReportPalette',
      params: { answers: JSON.stringify(parsedAnswers) },
    }), [router, parsedAnswers]);

  // Memoized option label generator
  const getOptionLabel = useCallback((index: number) =>
    String.fromCharCode(65 + index), []);

  // Memoized option style calculator
  const getOptionStyle = useCallback((option: any) => {
    if (!userAnswer) {
      return option.isCorrect
        ? [styles.optionUnattempted, styles.optionUnattemptedCorrect]
        : styles.optionUnattempted;
    }
    if (userAnswer === option.id) {
      return option.isCorrect ? styles.optionCorrect : styles.optionWrong;
    }
    return option.isCorrect ? styles.optionCorrect : styles.optionDefault;
  }, [userAnswer]);

  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === allQuestions.length - 1;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solutions</Text>
      </View>

      <View style={styles.contentContainer}>

        <View style={styles.questionHeader}>

          <Text style={styles.sectionTitle}>
            {currentQuestion?.sectionName || ''} (Q{currentIndex + 1}/{allQuestions.length})
          </Text>

          <View style={styles.rightContainer}>
            <TouchableOpacity onPress={toggleQuestionBookmark} style={styles.iconWrapper}>
              <Ionicons
                name={currentQuestionBookmarkStatus ? "bookmark" : "bookmark-outline"}
                size={20}
                color={
                  currentQuestion?.tags?.difficulty === 'Easy'
                    ? '#4CAF50'
                    : currentQuestion?.tags?.difficulty === 'Medium'
                      ? '#FFC107'
                      : currentQuestion?.tags?.difficulty === 'Hard'
                        ? '#F44336'
                        : '#888'
                }
              />
            </TouchableOpacity>

            {currentQuestion?.tags?.difficulty && (
              <View style={[
                styles.difficultyBadge,
                currentQuestion.tags.difficulty === 'Easy' ? { backgroundColor: '#4CAF50' } :
                  currentQuestion.tags.difficulty === 'Medium' ? { backgroundColor: '#FFC107' } :
                    { backgroundColor: '#F44336' }
              ]}>
                <Text style={styles.difficultyText}>
                  {currentQuestion.tags.difficulty}
                </Text>
              </View>
            )}
          </View>

        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.questionContainer}>
            {currentQuestion?.text?.includes('$') || currentQuestion?.text?.includes('\\') ? (
              <KatexRendered
                key={currentQuestion.id}
                content={currentQuestion.text}
                style={styles.mathView}
              />
            ) : (
              <Text style={styles.questionText}>{currentQuestion?.text}</Text>
            )}
            {currentQuestion?.imageUrl && (
              <Image
                source={{ uri: currentQuestion.imageUrl }}
                style={styles.questionImage}
                resizeMode="contain"
              />
            )}
          </View>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option: any, idx: number) => {
              const isSelected = userAnswer === option.id;
              const isCorrect = option.isCorrect;
              const isUserCorrect = isSelected && isCorrect;
              const isWrong = isSelected && !isCorrect;

              return (
                <View key={option.id} style={[styles.optionButton, getOptionStyle(option)]}>
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.optionLabelCircle,
                      isUserCorrect && { backgroundColor: '#3ec170' },
                      isWrong && { backgroundColor: '#F44336' },
                      !userAnswer && getOptionStyle(option) === styles.optionUnattemptedCorrect && { backgroundColor: '#3ec17022' },
                    ]}>
                      {isUserCorrect ? (
                        <Ionicons name="checkmark" size={20} color="#fff" />
                      ) : isWrong ? (
                        <Ionicons name="close" size={20} color="#fff" />
                      ) : (
                        <Text style={styles.optionLabelText}>{getOptionLabel(idx)}</Text>
                      )}
                    </View>
                    {option.text?.includes('$') || option.text?.includes('\\') ? (
                      <KatexRendered content={option.text} style={styles.mathView} />
                    ) : (
                      <Text style={styles.optionText}>{option.text}</Text>
                    )}
                    {option.imageUrl && (
                      <Image
                        source={{ uri: option.imageUrl }}
                        style={styles.optionImage}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                </View>
              );
            })}
            {!userAnswer && (
              <View style={styles.unattemptedContainer}>
                <Text style={styles.unattemptedText}>Unattempted</Text>
              </View>
            )}
          </View>

          {currentQuestion.explanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation</Text>
              <ScrollView
                style={styles.explanationScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                {currentQuestion.explanation.includes('$') || currentQuestion.explanation.includes('\\') ? (
                  <KatexRendered content={currentQuestion.explanation} style={styles.mathView} />
                ) : (
                  <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
                )}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton, isFirstQuestion && styles.disabledButton]}
          onPress={handlePrev}
          disabled={isFirstQuestion}
        >
          <Text style={[styles.navButtonText, isFirstQuestion && styles.disabledButtonText]}>
            PREV
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.questionsButton]}
          onPress={handleQuestionList}
        >
          <Text style={styles.navButtonTextQ}>QUESTIONS LIST</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton, isLastQuestion && styles.disabledButton]}
          onPress={handleNext}
          disabled={isLastQuestion}
        >
          <Text style={[styles.navButtonText, isLastQuestion && styles.disabledButtonText]}>
            NEXT
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center', // Center icon horizontally
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1f2937' },
  contentContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5',
    flexShrink: 1, // Prevents overflow
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: 15,
  },
  difficultyBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  difficultyText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
  },
  questionContainer: { marginBottom: 16, borderRadius: 8, padding: 10 },
  questionText: { fontSize: 16, lineHeight: 24, color: '#333', flex: 1, flexWrap: 'wrap' },
  questionImage: { width: '100%', height: 200, marginTop: 12, borderRadius: 4 },
  mathView: { width: '100%' },
  optionsContainer: { marginBottom: 24 },
  optionButton: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionContent: { flexDirection: 'row', alignItems: 'center' },
  optionLabelCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#6366f1',
  },
  optionLabelText: { fontWeight: 'bold', color: '#fff', fontSize: 16 },
  optionText: { fontSize: 15, color: '#22223b', flexShrink: 1, textAlignVertical: 'center' },
  optionImage: { width: '100%', height: 150 },
  optionCorrect: { borderColor: '#3ec170', backgroundColor: '#e6f9f0' },
  optionWrong: { borderColor: '#F44336', backgroundColor: '#fde8e8' },
  optionDefault: { borderColor: '#e5e7eb', backgroundColor: '#fff' },
  optionUnattempted: { borderColor: '#bdbdbd', backgroundColor: '#f3f4f6' },
  optionUnattemptedCorrect: { borderColor: '#3ec170', backgroundColor: '#f0fff4' },
  unattemptedContainer: { alignItems: 'center', marginTop: 8 },
  unattemptedText: { color: '#bdbdbd', fontStyle: 'italic', fontSize: 14 },
  explanationContainer: { backgroundColor: '#f0f9ff', borderRadius: 8, padding: 16, marginBottom: 16, maxHeight: 220 },
  explanationScroll: { maxHeight: 180 },
  explanationTitle: { fontSize: 16, fontWeight: '600', color: '#4F46E5', marginBottom: 8 },
  explanationText: { fontSize: 14, color: '#444', lineHeight: 22 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: { paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  prevButton: { borderRightWidth: 1, borderRightColor: '#9CA3AF' },
  nextButton: { borderLeftWidth: 1, borderLeftColor: '#9CA3AF' },
  questionsButton: { flex: 1, marginHorizontal: 8, backgroundColor: '#4F46E5', borderRadius: 0 },
  disabledButton: { backgroundColor: '#ffffff' },
  disabledButtonText: { color: '#E5E7EB' },
  navButtonText: { color: '#9CA3AF', fontWeight: '600', fontSize: 16 },
  navButtonTextQ: { color: '#ffffff', fontWeight: '500', fontSize: 16 },
});

export default QuizSolutionScreen;