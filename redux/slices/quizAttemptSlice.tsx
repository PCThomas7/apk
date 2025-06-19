// quizAttemptSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import courseServiceGet from '../../services/courseServiceGet';

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
}

interface CurrentQuizState extends QuizData {
  attempt: QuizAttemptState;
}

interface QuizState {
  currentQuiz: CurrentQuizState | null;
  loading: boolean;
  error: string | null;
}

const initialState: QuizState = {
  currentQuiz: null,
  loading: false,
  error: null,
};

interface QuestionStatus {
  answered: boolean;
  markedForReview: boolean;
  visited: boolean;
  markedAndAnswered: boolean;
}

interface QuestionsStatusMap {
  [questionId: string]: QuestionStatus;
}

export const fetchQuiz = createAsyncThunk(
  'quiz/fetchQuiz',
  async (quizId: string, { rejectWithValue }) => {
          // console.log("quizId : ",quizId)
    try {
      const response = await courseServiceGet.getQuiz(quizId);
      const quizData = response.quiz;
      // console.log("quizData : ",quizData)
      // Add proper interfaces for server response
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

      // Transform server data to frontend structure
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
            ].filter(opt => opt.text), // Filter out empty options
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
          markedForReview: {}
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
      }
    },
    updateTimeRemaining(state) {
      if (state.currentQuiz && state.currentQuiz.attempt.timeRemaining > 0) {
        state.currentQuiz.attempt.timeRemaining -= 1;
      }
    },
    submitQuiz(state) {
      if (state.currentQuiz) {
        // console.log("submit quiz : ",state.currentQuiz)
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
            markedForReview: {}
          }
        };
      })
      .addCase(fetchQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Helper selectors
export const selectCurrentQuestion = (state: { quiz: QuizState }) => {
  if (!state.quiz.currentQuiz) return null;
  const { currentSectionIndex, currentQuestionIndex } = state.quiz.currentQuiz.attempt;
  return state.quiz.currentQuiz.sections[currentSectionIndex].questions[currentQuestionIndex];
};

export const selectQuestionStatus = (state: { quiz: QuizState }): QuestionsStatusMap => {
  if (!state.quiz.currentQuiz) return {};

  const status: QuestionsStatusMap = {};

  state.quiz.currentQuiz.sections.forEach((section: QuizSection, sectionIndex: number) => {
    section.questions.forEach((question: QuizQuestion, questionIndex: number) => {
      const answered = state.quiz.currentQuiz!.attempt.answers[question.id] != null;
      const markedForReview = !!state.quiz.currentQuiz!.attempt.markedForReview[question.id];
      const visited =
        sectionIndex < state.quiz.currentQuiz!.attempt.currentSectionIndex ||
        (sectionIndex === state.quiz.currentQuiz!.attempt.currentSectionIndex &&
          questionIndex <= state.quiz.currentQuiz!.attempt.currentQuestionIndex);

      status[question.id] = {
        answered,
        markedForReview,
        visited,
        markedAndAnswered: answered && markedForReview
      };
    });
  });

  return status;
};


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

