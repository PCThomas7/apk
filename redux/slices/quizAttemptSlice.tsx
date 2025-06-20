// // quizAttemptSlice.ts
// import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
// import { createSelector } from '@reduxjs/toolkit';
// import courseServiceGet from '../../services/courseServiceGet';
// import { isEqual } from 'lodash';

// interface QuizOption {
//   id: string;
//   text: string;
//   isCorrect?: boolean;
//   imageUrl?: string;
// }

// interface QuizQuestion {
//   id: string;
//   text: string;
//   options: QuizOption[];
//   type: 'MCQ' | 'TrueFalse' | 'ShortAnswer' | 'MNCQ';
//   selectedOption?: string | null;
//   markedForReview: boolean;
//   imageUrl?: string;
//   explanation?: string;
//   marks: number;
//   negativeMarks: number;
//   tags: {
//     subject: string;
//     chapter: string;
//     topic: string;
//     difficulty: string;
//   };
// }

// interface QuizSection {
//   id: string;
//   name: string;
//   questions: QuizQuestion[];
//   marksPerQuestion: number;
//   negativeMarks: number;
// }

// interface QuizData {
//   id: string;
//   title: string;
//   description: string;
//   timeLimit: number;
//   passingScore: number;
//   sections: QuizSection[];
// }

// interface QuizAttemptState {
//   currentSectionIndex: number;
//   currentQuestionIndex: number;
//   timeRemaining: number;
//   submitted: boolean;
//   answers: Record<string, string | null>;
//   markedForReview: Record<string, boolean>;
//   visited: Record<string, boolean>;
// }

// interface CurrentQuizState extends QuizData {
//   id: string;
//   title: string;
//   description: string;
//   timeLimit: number;
//   passingScore: number;
//   sections: QuizSection[];
//   attempt: QuizAttemptState;
// }

// interface QuizState {
//   currentQuiz: CurrentQuizState | null;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: QuizState = {
//   currentQuiz: null,
//   loading: false,
//   error: null,
// };

// type QuestionStatusType = 'notVisited' | 'notAnswered' | 'answered' | 'markedForReview' | 'answeredAndMarkedForReview';

// interface QuestionStatus {
//   status: QuestionStatusType;
//   answered: boolean;
//   markedForReview: boolean;
//   visited: boolean;
//   markedAndAnswered: boolean; // This is the same as answeredAndMarkedForReview
// }

// interface QuestionsStatusMap {
//   [questionId: string]: QuestionStatus;
// }

// interface QuestionStatusResult {
//   statusMap: QuestionsStatusMap;
//   counts: Record<QuestionStatusType, number>;
// }

// export const fetchQuiz = createAsyncThunk(
//   'quiz/fetchQuiz',
//   async (quizId: string, { rejectWithValue }) => {
//     // console.log("quizId : ",quizId)
//     try {
//       const response = await courseServiceGet.getQuiz(quizId);
//       const quizData = response.quiz;
//       // console.log("quizData : ",quizData)
//       // Add proper interfaces for server response
//       interface ServerSection {
//         _id: string;
//         id: string;
//         name: string;
//         marks_per_question: number;
//         negative_marks: number;
//         questions: Array<{
//           _id: string;
//           id: string;
//           question_text: string;
//           option_a: string;
//           option_b: string;
//           option_c: string;
//           option_d: string;
//           option_e?: string;
//           option_a_image_url?: string;
//           option_b_image_url?: string;
//           option_c_image_url?: string;
//           option_d_image_url?: string;
//           option_e_image_url?: string;
//           correct_answer: string;
//           image_url?: string;
//           explanation?: string;
//           tags?: {
//             question_type?: string;
//             subject?: string;
//             chapter?: string;
//             topic?: string;
//             difficulty_level?: string;
//           };
//         }>;
//       }

//       // Transform server data to frontend structure
//       const transformedQuiz: QuizData = {
//         id: quizData._id || quizData.id,
//         title: quizData.title,
//         description: quizData.description,
//         timeLimit: quizData.timeLimit,
//         passingScore: quizData.passingScore,
//         sections: (quizData.sections as ServerSection[]).map(section => ({
//           id: section._id || section.id,
//           name: section.name,
//           marksPerQuestion: section.marks_per_question,
//           negativeMarks: section.negative_marks,
//           questions: section.questions.map(question => ({
//             id: question._id || question.id,
//             text: question.question_text,
//             options: [
//               { id: 'A', text: question.option_a, isCorrect: question.correct_answer === 'A', imageUrl: question.option_a_image_url },
//               { id: 'B', text: question.option_b, isCorrect: question.correct_answer === 'B', imageUrl: question.option_b_image_url },
//               { id: 'C', text: question.option_c, isCorrect: question.correct_answer === 'C', imageUrl: question.option_c_image_url },
//               { id: 'D', text: question.option_d, isCorrect: question.correct_answer === 'D', imageUrl: question.option_d_image_url },
//               ...(question.option_e ? [{ id: 'E', text: question.option_e, isCorrect: question.correct_answer === 'E', imageUrl: question.option_e_image_url }] : [])
//             ].filter(opt => opt.text), // Filter out empty options
//             type: question.tags?.question_type === 'MCQ' ? 'MCQ' :
//               question.tags?.question_type === 'TrueFalse' ? 'TrueFalse' :
//                 question.tags?.question_type === 'ShortAnswer' ? 'ShortAnswer' : 'MNCQ',
//             imageUrl: question.image_url,
//             explanation: question.explanation,
//             marks: section.marks_per_question,
//             negativeMarks: section.negative_marks,
//             tags: {
//               subject: question.tags?.subject || 'Physics',
//               chapter: question.tags?.chapter || 'Unknown',
//               topic: question.tags?.topic || 'General',
//               difficulty: question.tags?.difficulty_level || 'Medium'
//             },
//             markedForReview: false
//           }))
//         }))
//       };

//       return transformedQuiz;
//     } catch (error) {
//       return rejectWithValue(
//         error instanceof Error ? error.message : 'Failed to fetch quiz'
//       );
//     }
//   }
// );

// const quizSlice = createSlice({
//   name: 'quiz',
//   initialState,
//   reducers: {
//     startQuiz(state, action: PayloadAction<QuizData>) {
//       const payload = action.payload;
//       if (!payload?.sections) {
//         console.error('Invalid quiz data received:', payload);
//         return;
//       }

//       state.currentQuiz = {
//         ...payload,
//         attempt: {
//           currentSectionIndex: 0,
//           currentQuestionIndex: 0,
//           timeRemaining: payload.timeLimit * 60,
//           submitted: false,
//           answers: {},
//           markedForReview: {},
//           visited: { [payload.sections[0].questions[0].id]: true }
//         }
//       };
//     },
//     selectOption(state, action: PayloadAction<{ questionId: string; optionId: string | null }>) {
//       const { questionId, optionId } = action.payload;
//       if (state.currentQuiz) {
//         state.currentQuiz.attempt.answers[questionId] = optionId;
//       }
//     },
//     markForReview(state, action: PayloadAction<string>) {
//       const questionId = action.payload;
//       if (state.currentQuiz) {
//         const current = state.currentQuiz.attempt.markedForReview[questionId] || false;
//         state.currentQuiz.attempt.markedForReview[questionId] = !current;
//       }
//     },
//     navigateToQuestion(state, action: PayloadAction<{ sectionIndex: number; questionIndex: number }>) {
//       const { sectionIndex, questionIndex } = action.payload;
//       if (state.currentQuiz &&
//         sectionIndex >= 0 &&
//         sectionIndex < state.currentQuiz.sections.length &&
//         questionIndex >= 0 &&
//         questionIndex < state.currentQuiz.sections[sectionIndex].questions.length) {
//         state.currentQuiz.attempt.currentSectionIndex = sectionIndex;
//         state.currentQuiz.attempt.currentQuestionIndex = questionIndex;
//         // Mark as visited
//     const questionId = state.currentQuiz.sections[sectionIndex].questions[questionIndex].id;
//     state.currentQuiz.attempt.visited[questionId] = true;
//       }
//     },
//     updateTimeRemaining(state) {
//       if (state.currentQuiz && state.currentQuiz.attempt.timeRemaining > 0) {
//         state.currentQuiz.attempt.timeRemaining -= 1;
//       }
//     },
//     submitQuiz(state) {
//       if (state.currentQuiz) {
//         // console.log("submit quiz : ",state.currentQuiz)
//         state.currentQuiz.attempt.submitted = true;
//       }
//     },
//     resetQuiz(state) {
//       state.currentQuiz = null;
//     },
//     clearResponse(state, action: PayloadAction<string>) {
//       const questionId = action.payload;
//       if (state.currentQuiz) {
//         state.currentQuiz.attempt.answers[questionId] = null;
//       }
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchQuiz.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchQuiz.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentQuiz = {
//           ...action.payload,
//           attempt: {
//             currentSectionIndex: 0,
//             currentQuestionIndex: 0,
//             timeRemaining: action.payload.timeLimit * 60,
//             submitted: false,
//             answers: {},
//             markedForReview: {},
//           }
//         };
//       })
//       .addCase(fetchQuiz.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

// // Helper selectors
// export const selectCurrentQuestion = (state: { quiz: QuizState }) => {
//   if (!state.quiz.currentQuiz) return null;
//   const { currentSectionIndex, currentQuestionIndex } = state.quiz.currentQuiz.attempt;
//   return state.quiz.currentQuiz.sections[currentSectionIndex].questions[currentQuestionIndex];
// };

// export const selectQuestionStatus = createSelector(
//   [
//     (state: { quiz: QuizState }) => state.quiz.currentQuiz?.sections,
//     (state: { quiz: QuizState }) => state.quiz.currentQuiz?.attempt.answers,
//     (state: { quiz: QuizState }) => state.quiz.currentQuiz?.attempt.markedForReview,
//     (state: { quiz: QuizState }) => state.quiz.currentQuiz?.attempt.visited, // <-- add this
//   ],
//   (sections, answers, markedForReview, visited) => {
//     if (!sections) return {
//       statusMap: {},
//       counts: {
//         notVisited: 0,
//         notAnswered: 0,
//         answered: 0,
//         markedForReview: 0,
//         answeredAndMarkedForReview: 0
//       }
//     };

//     const statusMap: QuestionsStatusMap = {};
//     const counts = {
//       notVisited: 0,
//       notAnswered: 0,
//       answered: 0,
//       markedForReview: 0,
//       answeredAndMarkedForReview: 0
//     };

//     sections.forEach((section) => {
//       section.questions.forEach((question) => {
//         const isAnswered = answers?.[question.id] != null;
//         const isMarked = !!markedForReview?.[question.id];
//         const isVisited = !!visited?.[question.id];

//         let status: QuestionStatusType;
//         if (!isVisited) {
//           status = 'notVisited';
//           counts.notVisited++;
//         } else if (!isAnswered && !isMarked) {
//           status = 'notAnswered';
//           counts.notAnswered++;
//         } else if (isAnswered && !isMarked) {
//           status = 'answered';
//           counts.answered++;
//         } else if (!isAnswered && isMarked) {
//           status = 'markedForReview';
//           counts.markedForReview++;
//         } else {
//           status = 'answeredAndMarkedForReview';
//           counts.answeredAndMarkedForReview++;
//         }

//         statusMap[question.id] = {
//           status,
//           answered: isAnswered,
//           markedForReview: isMarked,
//           visited: isVisited,
//           markedAndAnswered: isAnswered && isMarked
//         };
//       });
//     });

//     return { statusMap, counts };
//   }
// );



// export const {
//   startQuiz,
//   selectOption,
//   markForReview,
//   navigateToQuestion,
//   updateTimeRemaining,
//   submitQuiz,
//   resetQuiz,
//   clearResponse
// } = quizSlice.actions;

// export default quizSlice.reducer;

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
import courseServiceGet from '../../services/courseServiceGet';
import { isEqual } from 'lodash';

interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  imageUrl?: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  type: 'MCQ' | 'TrueFalse' | 'ShortAnswer' | 'MNCQ';
  selectedOption?: string | null;
  markedForReview: boolean;
  imageUrl?: string;
  explanation?: string;
  marks: number;
  negativeMarks: number;
  tags: {
    subject: string;
    chapter: string;
    topic: string;
    difficulty: string;
  };
}

interface QuizSection {
  id: string;
  name: string;
  questions: QuizQuestion[];
  marksPerQuestion: number;
  negativeMarks: number;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  sections: QuizSection[];
}

interface QuizAttemptState {
  currentSectionIndex: number;
  currentQuestionIndex: number;
  timeRemaining: number;
  submitted: boolean;
  answers: Record<string, string | null>;
  markedForReview: Record<string, boolean>;
  visitedQuestions: Record<string, boolean>;
}

interface CurrentQuizState extends QuizData {
  attempt: QuizAttemptState;
}

interface QuizState {
  currentQuiz: CurrentQuizState | null;
  loading: boolean;
  error: string | null;
}

type QuestionStatusType = 
  | 'notVisited' 
  | 'notAnswered' 
  | 'answered' 
  | 'markedForReview' 
  | 'answeredAndMarkedForReview';

interface QuestionStatusDetails {
  status: QuestionStatusType;
  answered: boolean;
  markedForReview: boolean;
  visited: boolean;
  markedAndAnswered: boolean;
  sectionId: string;
  sectionName: string;
  questionIndex: number;
  sectionIndex: number;
}

interface QuestionsStatusMap {
  [questionId: string]: QuestionStatusDetails;
}

interface QuestionStatusResult {
  statusMap: QuestionsStatusMap;
  counts: Record<QuestionStatusType, number>;
}

const initialState: QuizState = {
  currentQuiz: null,
  loading: false,
  error: null,
};

export const fetchQuiz = createAsyncThunk(
  'quiz/fetchQuiz',
  async (quizId: string, { rejectWithValue }) => {
    try {
      const response = await courseServiceGet.getQuiz(quizId);
      const quizData = response.quiz;

      interface ServerSection {
        _id: string;
        id: string;
        name: string;
        marks_per_question: number;
        negative_marks: number;
        questions: Array<{
          _id: string;
          id: string;
          question_text: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          option_e?: string;
          option_a_image_url?: string;
          option_b_image_url?: string;
          option_c_image_url?: string;
          option_d_image_url?: string;
          option_e_image_url?: string;
          correct_answer: string;
          image_url?: string;
          explanation?: string;
          tags?: {
            question_type?: string;
            subject?: string;
            chapter?: string;
            topic?: string;
            difficulty_level?: string;
          };
        }>;
      }

      const transformedQuiz: QuizData = {
        id: quizData._id || quizData.id,
        title: quizData.title,
        description: quizData.description,
        timeLimit: quizData.timeLimit,
        passingScore: quizData.passingScore,
        sections: (quizData.sections as ServerSection[]).map(section => ({
          id: section._id || section.id,
          name: section.name,
          marksPerQuestion: section.marks_per_question,
          negativeMarks: section.negative_marks,
          questions: section.questions.map(question => ({
            id: question._id || question.id,
            text: question.question_text,
            options: [
              { id: 'A', text: question.option_a, isCorrect: question.correct_answer === 'A', imageUrl: question.option_a_image_url },
              { id: 'B', text: question.option_b, isCorrect: question.correct_answer === 'B', imageUrl: question.option_b_image_url },
              { id: 'C', text: question.option_c, isCorrect: question.correct_answer === 'C', imageUrl: question.option_c_image_url },
              { id: 'D', text: question.option_d, isCorrect: question.correct_answer === 'D', imageUrl: question.option_d_image_url },
              ...(question.option_e ? [{ id: 'E', text: question.option_e, isCorrect: question.correct_answer === 'E', imageUrl: question.option_e_image_url }] : [])
            ].filter(opt => opt.text),
            type: question.tags?.question_type === 'MCQ' ? 'MCQ' :
              question.tags?.question_type === 'TrueFalse' ? 'TrueFalse' :
                question.tags?.question_type === 'ShortAnswer' ? 'ShortAnswer' : 'MNCQ',
            imageUrl: question.image_url,
            explanation: question.explanation,
            marks: section.marks_per_question,
            negativeMarks: section.negative_marks,
            tags: {
              subject: question.tags?.subject || 'Physics',
              chapter: question.tags?.chapter || 'Unknown',
              topic: question.tags?.topic || 'General',
              difficulty: question.tags?.difficulty_level || 'Medium'
            },
            markedForReview: false
          }))
        }))
      };

      return transformedQuiz;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch quiz'
      );
    }
  }
);

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    startQuiz(state, action: PayloadAction<QuizData>) {
      const payload = action.payload;
      if (!payload?.sections) {
        console.error('Invalid quiz data received:', payload);
        return;
      }

      state.currentQuiz = {
        ...payload,
        attempt: {
          currentSectionIndex: 0,
          currentQuestionIndex: 0,
          timeRemaining: payload.timeLimit * 60,
          submitted: false,
          answers: {},
          markedForReview: {},
          visitedQuestions: { [payload.sections[0].questions[0].id]: true }
        }
      };
    },
    selectOption(state, action: PayloadAction<{ questionId: string; optionId: string | null }>) {
      const { questionId, optionId } = action.payload;
      if (state.currentQuiz) {
        state.currentQuiz.attempt.answers[questionId] = optionId;
      }
    },
    markForReview(state, action: PayloadAction<string>) {
      const questionId = action.payload;
      if (state.currentQuiz) {
        const current = state.currentQuiz.attempt.markedForReview[questionId] || false;
        state.currentQuiz.attempt.markedForReview[questionId] = !current;
      }
    },
    navigateToQuestion(state, action: PayloadAction<{ sectionIndex: number; questionIndex: number }>) {
      const { sectionIndex, questionIndex } = action.payload;
      if (state.currentQuiz &&
        sectionIndex >= 0 &&
        sectionIndex < state.currentQuiz.sections.length &&
        questionIndex >= 0 &&
        questionIndex < state.currentQuiz.sections[sectionIndex].questions.length) {
        state.currentQuiz.attempt.currentSectionIndex = sectionIndex;
        state.currentQuiz.attempt.currentQuestionIndex = questionIndex;
        const questionId = state.currentQuiz.sections[sectionIndex].questions[questionIndex].id;
        state.currentQuiz.attempt.visitedQuestions[questionId] = true;
      }
    },
    updateTimeRemaining(state) {
      if (state.currentQuiz && state.currentQuiz.attempt.timeRemaining > 0) {
        state.currentQuiz.attempt.timeRemaining -= 1;
      }
    },
    submitQuiz(state) {
      if (state.currentQuiz) {
        state.currentQuiz.attempt.submitted = true;
      }
    },
    resetQuiz(state) {
      state.currentQuiz = null;
    },
    clearResponse(state, action: PayloadAction<string>) {
      const questionId = action.payload;
      if (state.currentQuiz) {
        state.currentQuiz.attempt.answers[questionId] = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = {
          ...action.payload,
          attempt: {
            currentSectionIndex: 0,
            currentQuestionIndex: 0,
            timeRemaining: action.payload.timeLimit * 60,
            submitted: false,
            answers: {},
            markedForReview: {},
            visitedQuestions: { [action.payload.sections[0].questions[0].id]: true }
          }
        };
      })
      .addCase(fetchQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectCurrentQuestion = (state: { quiz: QuizState }) => {
  if (!state.quiz.currentQuiz) return null;
  const { currentSectionIndex, currentQuestionIndex } = state.quiz.currentQuiz.attempt;
  return state.quiz.currentQuiz.sections[currentSectionIndex].questions[currentQuestionIndex];
};

export const selectQuestionStatus = createSelector(
  [
    (state: { quiz: QuizState }) => state.quiz.currentQuiz?.sections,
    (state: { quiz: QuizState }) => state.quiz.currentQuiz?.attempt.answers,
    (state: { quiz: QuizState }) => state.quiz.currentQuiz?.attempt.markedForReview,
    (state: { quiz: QuizState }) => state.quiz.currentQuiz?.attempt.visitedQuestions,
  ],
  (sections, answers, markedForReview, visitedQuestions): QuestionStatusResult => {
    const initialResult: QuestionStatusResult = {
      statusMap: {},
      counts: {
        notVisited: 0,
        notAnswered: 0,
        answered: 0,
        markedForReview: 0,
        answeredAndMarkedForReview: 0
      }
    };

    if (!sections) return initialResult;

    return sections.reduce((result, section, sectionIndex) => {
      section.questions.forEach((question, questionIndex) => {
        const isAnswered = answers?.[question.id] != null;
        const isMarked = !!markedForReview?.[question.id];
        const isVisited = !!visitedQuestions?.[question.id];

        let status: QuestionStatusType;
        
        if (!isVisited) {
          status = 'notVisited';
          result.counts.notVisited++;
        } else if (isAnswered && isMarked) {
          status = 'answeredAndMarkedForReview';
          result.counts.answeredAndMarkedForReview++;
        } else if (isAnswered) {
          status = 'answered';
          result.counts.answered++;
        } else if (isMarked) {
          status = 'markedForReview';
          result.counts.markedForReview++;
        } else {
          status = 'notAnswered';
          result.counts.notAnswered++;
        }

        result.statusMap[question.id] = {
          status,
          answered: isAnswered,
          markedForReview: isMarked,
          visited: isVisited,
          markedAndAnswered: isAnswered && isMarked,
          sectionId: section.id,
          sectionName: section.name,
          questionIndex,
          sectionIndex
        };
      });
      return result;
    }, {...initialResult});
  }
);

export const {
  startQuiz,
  selectOption,
  markForReview,
  navigateToQuestion,
  updateTimeRemaining,
  submitQuiz,
  resetQuiz,
  clearResponse
} = quizSlice.actions;

export default quizSlice.reducer;