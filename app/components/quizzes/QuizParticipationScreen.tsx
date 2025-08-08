import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Pressable,
  Dimensions,
  TextInput
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import {
  selectOption,
  markForReview,
  navigateToQuestion,
  updateTimeRemaining,
  submitQuiz,
  submitQuizThunk,
  clearResponse
} from '../../../redux/slices/quizAttemptSlice';
import { Picker } from '@react-native-picker/picker';
import ResponsiveGridSkeleton from '../skeltons/Skelton';
import KatexRenderer from './KatexRenderer';
import { Platform } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import { ChevronDown, ChevronUp, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppState } from 'react-native';


const QuizParticipationScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentQuiz, loading, error } = useSelector((state: RootState) => state.quiz);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundStartTime = useRef<number | null>(null);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const windowWidth = Dimensions.get('window').width;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [questionHeights, setQuestionHeights] = useState<{ [questionId: string]: number }>({});

  if (loading) {
    return <ResponsiveGridSkeleton />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!currentQuiz?.sections?.length) {
    return (
      <View style={styles.container}>
        <Text>No quiz data available</Text>
      </View>
    );
  }

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background') {
        backgroundStartTime.current = Date.now();
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else if (nextAppState === 'active' && backgroundStartTime.current) {
        const secondsInBackground = Math.floor(
          (Date.now() - backgroundStartTime.current) / 1000
        );
        if (secondsInBackground > 0) {
          dispatch(updateTimeRemaining(secondsInBackground)); // With payload
        }
        backgroundStartTime.current = null;

        if (!timerRef.current && currentQuiz.attempt.timeRemaining > 0 && !currentQuiz.attempt.submitted) {
          timerRef.current = setInterval(() => {
            dispatch(updateTimeRemaining()); // Without payload (will use default 1)
          }, 1000);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    if (currentQuiz.attempt.timeRemaining > 0 && !currentQuiz.attempt.submitted) {
      timerRef.current = setInterval(() => {
        dispatch(updateTimeRemaining()); // Without payload
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      subscription.remove();
    };
  }, [currentQuiz.attempt.timeRemaining, currentQuiz.attempt.submitted, dispatch]);

  useEffect(() => {
    const submitIfTimeUp = async () => {
      if (currentQuiz.attempt.timeRemaining <= 0 && !currentQuiz.attempt.submitted) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        dispatch(submitQuiz());
        await handleThunkAndNavigate(submitQuizThunk, '/components/quizzes/QuizReport');
      }
    };
    submitIfTimeUp();
  }, [currentQuiz.attempt.timeRemaining, currentQuiz.attempt.submitted, dispatch]);

  const currentSection = currentQuiz.sections[currentQuiz.attempt.currentSectionIndex];
  const currentQuestion = currentSection.questions[currentQuiz.attempt.currentQuestionIndex];
  // console.log("currentQuestion : ",currentQuestion);
  const selectedOption = currentQuiz.attempt.answers[currentQuestion.id] || null;
  const isMarkedForReview = currentQuiz.attempt.markedForReview[currentQuestion.id] || false;

  const isFirstQuestionInSection = currentQuiz.attempt.currentQuestionIndex === 0;
  const isLastQuestionInSection = currentQuiz.attempt.currentQuestionIndex === currentSection.questions.length - 1;
  const isFirstSection = currentQuiz.attempt.currentSectionIndex === 0;
  const isLastSection = currentQuiz.attempt.currentSectionIndex === currentQuiz.sections.length - 1;
  const isLastQuestionOfQuiz = isLastQuestionInSection && isLastSection;

  const handleOptionSelect = (questionId: string, optionId: string) => {
    dispatch(selectOption({ questionId, optionId }));
  };

  const handleMarkForReview = (questionId: string) => {
    dispatch(markForReview(questionId));
  };

  const handleSectionChange = (sectionIndex: number) => {
    dispatch(navigateToQuestion({ sectionIndex, questionIndex: 0 }));
    setShowSectionPicker(false);
  };

  const handlePrevious = () => {
    if (isFirstQuestionInSection && !isFirstSection) {
      // Go to last question of previous section
      const prevSectionIndex = currentQuiz.attempt.currentSectionIndex - 1;
      const prevSection = currentQuiz.sections[prevSectionIndex];
      dispatch(navigateToQuestion({
        sectionIndex: prevSectionIndex,
        questionIndex: prevSection.questions.length - 1
      }));
    } else if (!isFirstQuestionInSection) {
      // Go to previous question in current section
      dispatch(navigateToQuestion({
        sectionIndex: currentQuiz.attempt.currentSectionIndex,
        questionIndex: currentQuiz.attempt.currentQuestionIndex - 1
      }));
    }
  };

  const handleNext = async () => {
    if (isLastQuestionInSection && !isLastSection) {
      // Go to first question of next section
      dispatch(navigateToQuestion({
        sectionIndex: currentQuiz.attempt.currentSectionIndex + 1,
        questionIndex: 0
      }));
    } else if (!isLastQuestionInSection) {
      // Go to next question in current section
      dispatch(navigateToQuestion({
        sectionIndex: currentQuiz.attempt.currentSectionIndex,
        questionIndex: currentQuiz.attempt.currentQuestionIndex + 1
      }));
    } else if (isLastQuestionOfQuiz) {
      // Submit if it's the last question of the quiz
      dispatch(submitQuiz());
      await handleThunkAndNavigate(submitQuizThunk, '/components/quizzes/QuizReport');
    }
  };

  const handleThunkAndNavigate = async (
    thunk: any,
    route: string // stays as string, but see cast below
  ) => {
    const result = await dispatch(thunk());

    if (thunk.fulfilled.match(result)) {
      router.replace(route as any); // 👈 Fix TS error by casting if needed
    } else {
      console.error('Action failed:', result.payload);
    }
  };

const renderOptionContent = (option: {text?: string, imageUrl?: string}) => {
  // First check if there's an image URL to display
  if (option.imageUrl) {
    return (
      <Image
        source={{ uri: option.imageUrl }}
         style={{ width: 200, height: 100, resizeMode: 'contain' }}
        resizeMode="contain"
      />
    );
  }
  // Then check for math content in the text
  else if (option.text && (option.text.includes('$') || option.text.includes('\\'))) {
    return <KatexRenderer content={option.text} style={styles.mathView} />;
  }
  // Finally, just render the text
  else if (option.text) {
    return (
      <Text style={[styles.optionText, selectedOption === option.text && styles.selectedOptionText]}>
        {option.text}
      </Text>
    );
  }
  return null; // fallback if neither exists
};

  const handleSubmit = async () => {
    dispatch(submitQuiz()); // Optional, if needed before thunk
    await handleThunkAndNavigate(submitQuizThunk, '/components/quizzes/QuizReport');
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>

        <TouchableOpacity
          style={[styles.submitButton, currentQuiz.attempt.submitted && styles.submittedButton]}
          onPress={() => handleSubmit()}
          disabled={currentQuiz.attempt.submitted}
        >

          <Text style={styles.submitButtonText}>
            {currentQuiz.attempt.submitted ? 'Submitted' : 'Submit'}
          </Text>
        </TouchableOpacity>

        <View style={styles.timerContainer}>
          <Text style={styles.timerIcon}>🕒</Text>
          <Text style={styles.timer}>
            {Math.floor(currentQuiz.attempt.timeRemaining / 60)}:
            {(currentQuiz.attempt.timeRemaining % 60).toString().padStart(2, '0')}
          </Text>
        </View>

      </View>


      {/* Section Picker */}
      <View style={styles.sectionHeader}>
        <View style={styles.pickerWrapper}>
          <TouchableOpacity
            style={[
              styles.customPicker,
              isDropdownOpen && styles.customPickerPressed
            ]}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionLabel}>
              {currentQuiz.sections[currentQuiz.attempt.currentSectionIndex]?.name || 'Select Section'}
            </Text>
            {isDropdownOpen ? (
              <ChevronUp size={16} color="#374151" />
            ) : (
              <ChevronDown size={16} color="#374151" />
            )}
          </TouchableOpacity>

          {isDropdownOpen && (
            <View style={styles.dropdown}>
              <ScrollView
                style={{ maxHeight: 400 }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {currentQuiz.sections.map((section, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      index === currentQuiz.sections.length - 1 && styles.dropdownItemLast,
                      index === currentQuiz.attempt.currentSectionIndex && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      handleSectionChange(index);
                      setIsDropdownOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        index === currentQuiz.attempt.currentSectionIndex && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {section.name}
                    </Text>
                    {index === currentQuiz.attempt.currentSectionIndex && (
                      <Check size={16} color="#D97706" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>


      {/* Question Container */}
      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>
            Question {currentQuiz.attempt.currentQuestionIndex + 1} of {currentSection.questions.length}
          </Text>
          <View style={styles.marksContainer}>
            <Text style={styles.marksText}>Marks: +{currentQuestion.marks}</Text>
            <Text style={styles.negativeMarksText}>Negative: -{currentQuestion.negativeMarks}</Text>
          </View>
        </View>

        {/* Question Text */}
        <View style={styles.questionTextContainer}>
          {currentQuestion.text.includes('$') || currentQuestion.text.includes('\\') ? (
            <View
              style={{ minHeight: 1 }}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                const currentHeight = questionHeights[currentQuestion.id] || 0;

                // Apply only if significantly different (to prevent jitter)
                if (Math.abs(currentHeight - height) > 2) {
                  setQuestionHeights((prev) => ({
                    ...prev,
                    [currentQuestion.id]: height,
                  }));
                }
              }}
            >
              <KatexRenderer
                key={currentQuestion.id}
                content={currentQuestion.text}
                style={styles.mathView}
              />
            </View>

          ) : (
            <Text style={styles.questionText}>{currentQuestion.text}</Text>
          )}
          {currentQuestion?.imageUrl && (
            <Image
              source={{ uri: currentQuestion.imageUrl }}
              style={styles.questionImage}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.type === 'Numeric' ? (
            <TextInput
              style={styles.numericInput}
              placeholder="Enter your answer"
              keyboardType="numeric"
              value={currentQuiz.attempt.answers[currentQuestion.id] || ''}
              onChangeText={(text) =>
                dispatch(selectOption({
                  questionId: currentQuestion.id,
                  optionId: text
                }))
              }
            />
          ) : (
            currentQuestion.options.map((option) => {
              const currentAnswer = currentQuiz.attempt.answers[currentQuestion.id];
              const isSelected = currentQuestion.type === 'MMCQ'
                ? currentAnswer?.split(',').includes(option.id)
                : currentAnswer === option.id;

              return (
                <Pressable
                  key={option.id}
                  style={({ pressed }) => [
                    styles.optionButton,
                    isSelected && styles.selectedOption,
                    pressed && styles.pressedOption
                  ]}
                  onPress={() => handleOptionSelect(currentQuestion.id, option.id)}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.optionIndicator,
                      currentQuestion.type === 'MCQ' ? styles.radio : styles.checkbox,
                      isSelected && styles.optionSelected
                    ]}>
                      {isSelected && (
                        currentQuestion.type === 'MCQ' ? (
                          <View style={styles.optionIndicatorInner} />
                        ) : (
                          <Ionicons name="checkbox" size={16} color="#2196F3" />
                        )
                      )}
                    </View>
                    {renderOptionContent(option)}
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

        {/* Mark for Review Button */}
        <TouchableOpacity
          style={[styles.markButton, isMarkedForReview && styles.markedButton]}
          onPress={() => handleMarkForReview(currentQuestion.id)}
        >
          <Text style={[styles.markButtonText, isMarkedForReview && styles.markedButtonText]}>
            {isMarkedForReview ? '✓ Marked for Review' : 'Mark for Review'}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.prevButton,
            isFirstQuestionInSection && isFirstSection && styles.disabledButton,
          ]}
          onPress={handlePrevious}
          disabled={isFirstQuestionInSection && isFirstSection}
        >
          <Text style={[
            styles.navButtonText,
            isFirstQuestionInSection && isFirstSection && styles.disabledButtonText,
          ]}>
            PREV
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.questionsButton]}
          onPress={() => router.push('/components/quizzes/QuestionPalette')}>
          <Text style={styles.navButtonTextQ}>QUESTIONS LIST</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextButton,
            isLastQuestionOfQuiz && styles.endButton
          ]}
          onPress={handleNext}
        >
          <Text style={[
            styles.navButtonText,
            isLastQuestionOfQuiz && styles.endButtonText
          ]}>
            {isLastQuestionOfQuiz ? 'END' : 'NEXT'}
          </Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timerContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    columnGap: 10
  },
  timerIcon: {
    fontSize: 18,
    color: '#4F46E5',
  },
  timer: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937', // gray-800
  },
  submitButton: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    backgroundColor: '#4F46E5', // Elegant Indigo
    borderRadius: 0,
  },
  submittedButton: {
    backgroundColor: '#D1D5DB', // Gray for disabled state
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Styles
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFBEB', // Soft yellow background
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // light gray
    position: 'relative', // Important for dropdown positioning
    zIndex: 1000, // Ensure dropdown appears above other elements
  },

  pickerWrapper: {
    flex: 1,
    position: 'relative',
  },

  customPicker: {
    height: 35,
    borderWidth: 1,
    borderColor: '#FBBF24', // yellow-400
    borderRadius: 8,
    backgroundColor: '#FEF3C7', // yellow-100
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },

  customPickerPressed: {
    backgroundColor: '#FDE68A', // yellow-200 when pressed
    borderColor: '#F59E0B', // yellow-500
  },

  sectionLabel: {
    flex: 1,
    fontSize: 14,
    color: '#111827', // slate-900
    fontWeight: '500',
  },

  dropdown: {
    position: 'absolute',
    top: 37, // Just below the picker
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FBBF24',
    borderRadius: 8,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // Android shadow
    zIndex: 1001,
  },

  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },

  dropdownItemLast: {
    borderBottomWidth: 0,
  },

  dropdownItemSelected: {
    backgroundColor: '#FEF3C7', // yellow-100
  },

  dropdownItemPressed: {
    backgroundColor: '#F3F4F6', // gray-100
  },

  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },

  dropdownItemTextSelected: {
    fontWeight: '600',
    color: '#D97706', // yellow-600
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  marksContainer: {
    flexDirection: 'row',
  },
  marksText: {
    color: '#4CAF50',
    marginRight: 16,
    fontSize: 14,
  },
  questionImage: { width: '100%', height: 200, marginTop: 12, borderRadius: 4 },
  negativeMarksText: {
    color: '#F44336',
    fontSize: 14,
  },
  questionTextContainer: {
    marginBottom: 24,
    height: "auto"
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  mathView: {
    width: '100%',
    // minHeight: 40,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'rgb(250, 250, 249)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow:'hidden'
  },
  selectedOption: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  pressedOption: {
    opacity: 0.7,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#757575',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numericInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  radio: {
    borderRadius: 12,
  },
  checkbox: {
    borderRadius: 4,
  },
  optionSelected: {
    borderColor: '#2196F3',
  },
  optionIndicatorInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#2196F3',
  },
  optionImage: {
    marginLeft: 36,
  },
  markButton: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  markedButton: {
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  markButtonText: {
    color: '#D97706',
    fontWeight: '600',
    fontSize: 16,
  },
  markedButtonText: {
    color: '#92400E',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButton: {
    borderRightWidth: 1,
    borderRightColor: '#9CA3AF',
  },
  nextButton: {
    borderLeftWidth: 1,
    borderLeftColor: '#9CA3AF',
  },
  questionsButton: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 0,
  },
  endButton: {
    backgroundColor: '#ffffff',
    color: '#b30047'
  },
  endButtonText: {
    color: '#cc0052',
  },
  disabledButton: {
    backgroundColor: '#ffffff',
  },
  disabledButtonText: {
    color: '#E5E7EB',
  },
  navButtonText: {
    color: '#9CA3AF',
    fontWeight: '600',
    fontSize: 16,
  },
  navButtonTextQ: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default QuizParticipationScreen;



// use to overcome math expressions aren't displaying correctly (showing just parts like \(0, instead of the full expressions)
// const renderOptionContent = (optionText: string) => {
//     if (optionText.startsWith('http')) {
//         return (
//             <Image
//                 source={{ uri: optionText }}
//                 style={[styles.optionImage, { width: windowWidth - 100, height: 200 }]}
//                 resizeMode="contain"
//             />
//         );
//     }

//     // First, clean up the option text
//     const cleanedText = optionText
//         .replace(/\\\\/g, '') // Remove line breaks for math display
//         .trim();

//     // Check if it's a math expression (contains $ or LaTeX commands)
//     if (cleanedText.includes('$') || cleanedText.includes('\\')) {
//         // For options that are purely math (wrapped in $)
//         if (/^\$.*\$$/.test(cleanedText)) {
//             return <KatexRenderer content={cleanedText.slice(1, -1)} displayMode={false} style={styles.mathView} />;
//         }
//         // For mixed content or LaTeX commands
//         return <KatexRenderer content={cleanedText} displayMode={false} style={styles.mathView} />;
//     }

//     // Regular text
//     return (
//         <Text style={[styles.optionText, selectedOption === optionText && styles.selectedOptionText]}>
//             {optionText}
//         </Text>
//     );
// };

// use this if needs timer proper in background and minimize
// const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


// Timer implementation
// useEffect(() => {
//   if (currentQuiz.attempt.timeRemaining > 0 && !currentQuiz.attempt.submitted) {
//     timerRef.current = setInterval(() => {
//       dispatch(updateTimeRemaining());
//     }, 1000);
//   }

//   return () => {
//     if (timerRef.current) clearInterval(timerRef.current);
//   };
// }, [currentQuiz.attempt.timeRemaining, currentQuiz.attempt.submitted, dispatch]);

// Auto submit when time runs out
// useEffect(() => {
//   const submitIfTimeUp = async () => {
//     if (
//       currentQuiz.attempt.timeRemaining <= 0 &&
//       !currentQuiz.attempt.submitted
//     ) {
//       dispatch(submitQuiz());
//       await handleThunkAndNavigate(submitQuizThunk, '/components/quizzes/QuizReport');
//     }
//   };

//   submitIfTimeUp();
// }, [
//   currentQuiz.attempt.timeRemaining,
//   currentQuiz.attempt.submitted,
//   dispatch,
// ]);


{/* <Text style={styles.submitButtonText}>
            {currentQuiz.attempt.submitted ? 'Submitted' : 'Submit'}
          </Text> */}
