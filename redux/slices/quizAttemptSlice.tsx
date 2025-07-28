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
//   visitedQuestions: Record<string, boolean>;
// }

// interface CurrentQuizState extends QuizData {
//   attempt: QuizAttemptState;
// }

// interface QuizState {
//   currentQuiz: CurrentQuizState | null;
//   loading: boolean;
//   error: string | null;
// }

// type QuestionStatusType = 
//   | 'notVisited' 
//   | 'notAnswered' 
//   | 'answered' 
//   | 'markedForReview' 
//   | 'answeredAndMarkedForReview';

// interface QuestionStatusDetails {
//   status: QuestionStatusType;
//   answered: boolean;
//   markedForReview: boolean;
//   visited: boolean;
//   markedAndAnswered: boolean;
//   sectionId: string;
//   sectionName: string;
//   questionIndex: number;
//   sectionIndex: number;
// }

// interface QuestionsStatusMap {
//   [questionId: string]: QuestionStatusDetails;
// }

// interface QuestionStatusResult {
//   statusMap: QuestionsStatusMap;
//   counts: Record<QuestionStatusType, number>;
// }

// const initialState: QuizState = {
//   currentQuiz: null,
//   loading: false,
//   error: null,
// };

// export const fetchQuiz = createAsyncThunk(
//   'quiz/fetchQuiz',
//   async (quizId: string, { rejectWithValue }) => {
//     try {
//       const response = await courseServiceGet.getQuiz(quizId);
//       const quizData = response.quiz;

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
//             ].filter(opt => opt.text),
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
//           visitedQuestions: { [payload.sections[0].questions[0].id]: true }
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
//         const questionId = state.currentQuiz.sections[sectionIndex].questions[questionIndex].id;
//         state.currentQuiz.attempt.visitedQuestions[questionId] = true;
//       }
//     },
//     updateTimeRemaining(state) {
//       if (state.currentQuiz && state.currentQuiz.attempt.timeRemaining > 0) {
//         state.currentQuiz.attempt.timeRemaining -= 1;
//       }
//     },
//     submitQuiz(state) {
//       if (state.currentQuiz) {
//         state.currentQuiz.attempt.submitted = true;
//         // console.log("currentQuiz : ",state.currentQuiz)
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
//             visitedQuestions: { [action.payload.sections[0].questions[0].id]: true }
//           }
//         };
//       })
//       .addCase(fetchQuiz.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

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
//     (state: { quiz: QuizState }) => state.quiz.currentQuiz?.attempt.visitedQuestions,
//   ],
//   (sections, answers, markedForReview, visitedQuestions): QuestionStatusResult => {
//     const initialResult: QuestionStatusResult = {
//       statusMap: {},
//       counts: {
//         notVisited: 0,
//         notAnswered: 0,
//         answered: 0,
//         markedForReview: 0,
//         answeredAndMarkedForReview: 0
//       }
//     };

//     if (!sections) return initialResult;

//     return sections.reduce((result, section, sectionIndex) => {
//       section.questions.forEach((question, questionIndex) => {
//         const isAnswered = answers?.[question.id] != null;
//         const isMarked = !!markedForReview?.[question.id];
//         const isVisited = !!visitedQuestions?.[question.id];

//         let status: QuestionStatusType;

//         if (!isVisited) {
//           status = 'notVisited';
//           result.counts.notVisited++;
//         } else if (isAnswered && isMarked) {
//           status = 'answeredAndMarkedForReview';
//           result.counts.answeredAndMarkedForReview++;
//         } else if (isAnswered) {
//           status = 'answered';
//           result.counts.answered++;
//         } else if (isMarked) {
//           status = 'markedForReview';
//           result.counts.markedForReview++;
//         } else {
//           status = 'notAnswered';
//           result.counts.notAnswered++;
//         }

//         result.statusMap[question.id] = {
//           status,
//           answered: isAnswered,
//           markedForReview: isMarked,
//           visited: isVisited,
//           markedAndAnswered: isAnswered && isMarked,
//           sectionId: section.id,
//           sectionName: section.name,
//           questionIndex,
//           sectionIndex
//         };
//       });
//       return result;
//     }, {...initialResult});
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
import courseServicePost from '../../services/courseServicePost';
import { isEqual } from 'lodash';
import * as SecureStore from 'expo-secure-store';


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
  type: 'MCQ' | 'Numeric' | 'MMCQ';
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
  createdAt?: string;
}

interface QuizAttemptState {
  currentSectionIndex: number;
  currentQuestionIndex: number;
  timeRemaining: number;
  submitted: boolean;
  answers: Record<string, string | null>;
  markedForReview: Record<string, boolean>;
  visitedQuestions: Record<string, boolean>;
  timeSpent?: number;
}

interface CurrentQuizState extends QuizData {
  attempt: QuizAttemptState;
}

interface QuizState {
  currentQuiz: CurrentQuizState | null;
  loading: boolean;
  error: string | null;
  submissionLoading: boolean;
  submissionError: string | null;
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
  submissionLoading: false,
  submissionError: null,
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
          questions: section.questions.map(question => {
            // Determine question type
            const questionType = question.tags?.question_type === 'MCQ' ? 'MCQ' :
              question.tags?.question_type === 'MMCQ' ? 'MMCQ' :
                question.tags?.question_type === 'Numeric' ? 'Numeric' : 'MCQ';

            // Handle options differently based on question type
            let options = [];
            if (questionType === 'Numeric') {
              // For numeric questions, we might just need the correct answer value
              // Adjust this based on how your numeric answers are stored
              options = [
                {
                  id: 'A',
                  text: question.correct_answer, // or question.option_a if that's where numeric answer is stored
                  isCorrect: true,
                  imageUrl: question.option_a_image_url
                }
              ].filter(opt => opt.text !== undefined && opt.text !== null);
            } else {
              // For MCQ and MMCQ
              options = [
                {
                  id: 'A', text: question.option_a, isCorrect: questionType === 'MMCQ'
                    ? question.correct_answer.includes('A')
                    : question.correct_answer === 'A',
                  imageUrl: question.option_a_image_url
                },
                {
                  id: 'B', text: question.option_b, isCorrect: questionType === 'MMCQ'
                    ? question.correct_answer.includes('B')
                    : question.correct_answer === 'B',
                  imageUrl: question.option_b_image_url
                },
                {
                  id: 'C', text: question.option_c, isCorrect: questionType === 'MMCQ'
                    ? question.correct_answer.includes('C')
                    : question.correct_answer === 'C',
                  imageUrl: question.option_c_image_url
                },
                {
                  id: 'D', text: question.option_d, isCorrect: questionType === 'MMCQ'
                    ? question.correct_answer.includes('D')
                    : question.correct_answer === 'D',
                  imageUrl: question.option_d_image_url
                },
                ...(question.option_e ? [{
                  id: 'E',
                  text: question.option_e,
                  isCorrect: questionType === 'MMCQ'
                    ? question.correct_answer.includes('E')
                    : question.correct_answer === 'E',
                  imageUrl: question.option_e_image_url
                }] : [])
              ].filter(opt => opt.text);
            }

            return {
              id: question._id || question.id,
              text: question.question_text,
              options,
              type: questionType,
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
            };
          })
        })),
        createdAt: quizData.createdAt
      };

      return transformedQuiz;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch quiz'
      );
    }
  }
);

async function getUserDetails() {
  try {
    const userDetailsString = await SecureStore.getItemAsync('userDetails');
    return userDetailsString ? JSON.parse(userDetailsString) : null;
  } catch (error) {
    console.error('Error reading user details:', error);
    return null;
  }
}

export const submitQuizThunk = createAsyncThunk(
  'quiz/submitQuizAttempt',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { quiz: QuizState };
    const { currentQuiz } = state.quiz;

    if (!currentQuiz) {
      return rejectWithValue('No active quiz to submit');
    }

    // Get user details from SecureStore
    const userDetails = await getUserDetails();
    const userId = userDetails?.id || userDetails?._id;

    if (!userId) {
      return rejectWithValue('User ID not found in SecureStore');
    }

    const { id: quizId, timeLimit, sections } = currentQuiz;
    const { answers, timeRemaining, submitted } = currentQuiz.attempt;

    if (!submitted) {
      return rejectWithValue('Quiz not marked as submitted');
    }

    // Build answers for all questions in the format the server expects
    const allAnswers: Record<string, string[]> = {};

    sections.forEach(section => {
      section.questions.forEach(question => {
        const answer = answers[question.id];

        if (answer) {
          // For MMCQ, split comma-separated values into array and remove duplicates
          if (question.type === 'MMCQ') {
            allAnswers[question.id] = [...new Set(answer.split(','))];
          }
          // For other types, use as single-item array
          else {
            allAnswers[question.id] = [answer];
          }
        } else {
          allAnswers[question.id] = [];
        }
      });
    });

    const attemptData = {
      quiz: quizId,
      user: userId,
      answers: allAnswers,
      timeSpent: (timeLimit * 60) - timeRemaining,
      completed: true,
      score: 0,
      maxScore: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      unattemptedAnswers: 0
    };
    try {
      const response = await courseServicePost.submitQuizAttempt(quizId, attemptData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to submit quiz attempt'
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
      if (!state.currentQuiz) return;

      const question = state.currentQuiz.sections
        .flatMap(section => section.questions)
        .find(q => q.id === questionId);

      if (!question) return;

      const currentAnswer = state.currentQuiz.attempt.answers[questionId];

      switch (question.type) {
        case 'MCQ': // Single selection (radio button)
          // Toggle: if clicking the same option, deselect it
          state.currentQuiz.attempt.answers[questionId] =
            currentAnswer === optionId ? null : optionId;
          break;

        case 'MMCQ': // Multiple selection (checkboxes)
          const currentSelections = currentAnswer ? currentAnswer.split(',') : [];
          const newSelections = currentSelections.includes(optionId!)
            ? currentSelections.filter(id => id !== optionId)
            : [...currentSelections, optionId!];
          state.currentQuiz.attempt.answers[questionId] =
            newSelections.length > 0 ? newSelections.join(',') : null;
          break;

        case 'Numeric': // Direct value
          state.currentQuiz.attempt.answers[questionId] = optionId;
          break;

        default:
          break;
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
    // updateTimeRemaining(state) {
    //   if (state.currentQuiz && state.currentQuiz.attempt.timeRemaining > 0) {
    //     state.currentQuiz.attempt.timeRemaining -= 1;
    //   }
    // },// if it have timing issues in background or use below updateTimeRemaining
    updateTimeRemaining: {
      reducer(state, action: PayloadAction<number | undefined>) {
        const secondsElapsed = action.payload ?? 1; // Default to 1 if undefined
        if (state.currentQuiz && state.currentQuiz.attempt.timeRemaining > 0) {
          state.currentQuiz.attempt.timeRemaining = Math.max(
            0,
            state.currentQuiz.attempt.timeRemaining - secondsElapsed
          );
        }
      },
      prepare(seconds?: number) {
        return { payload: seconds };
      }
    },
    submitQuiz(state) {
      if (state.currentQuiz) {
        state.currentQuiz.attempt.submitted = true;
        const { timeLimit, attempt } = state.currentQuiz;
        state.currentQuiz.attempt.timeSpent = (timeLimit * 60) - attempt.timeRemaining;
      }
    },
    resetQuiz(state) {
      state.currentQuiz = null;
      state.error = null;
      state.submissionError = null;
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
      })
      .addCase(submitQuizThunk.pending, (state) => {
        state.submissionLoading = true;
        state.submissionError = null;
      })
      .addCase(submitQuizThunk.fulfilled, (state) => {
        state.submissionLoading = false;
      })
      .addCase(submitQuizThunk.rejected, (state, action) => {
        state.submissionLoading = false;
        state.submissionError = action.payload as string;
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
    }, { ...initialResult });
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

// 1. Add a new field outside QuizState for the selected solution question id
interface SolutionState {
  selectedQuestionId?: string;
}

// 2. Add to your combined initial state
const initialSolutionState: SolutionState = {
  selectedQuestionId: undefined,
};

// 3. Add a new slice for solution selection
const solutionSlice = createSlice({
  name: 'solution',
  initialState: initialSolutionState,
  reducers: {
    setSolutionSelectedQuestionId(state, action: PayloadAction<string | undefined>) {
      state.selectedQuestionId = action.payload;
    },
  },
});

// 4. Export the action and reducer
export const { setSolutionSelectedQuestionId } = solutionSlice.actions;
export const solutionReducer = solutionSlice.reducer;