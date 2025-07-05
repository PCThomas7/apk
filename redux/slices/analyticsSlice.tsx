// analyticsSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import courseServiceGet from '@/services/courseServiceGet';


// ==================== Type Definitions ====================
export interface SubjectPerformance {
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface DifficultyPerformance {
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface QuestionTypePerformance {
  questionType: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface RecentPerformance {
  quizId: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
}

export interface TimeSpentAnalysis {
  totalTimeSpent: number;
  averageTimePerQuiz: number;
  averageTimePerQuestion: number;
}

export interface StudentAnalytics {
  totalAttempts: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  subjectPerformance: SubjectPerformance[];
  difficultyPerformance: DifficultyPerformance[];
  questionTypePerformance: QuestionTypePerformance[];
  recentPerformance: RecentPerformance[];
  timeSpentAnalysis: TimeSpentAnalysis;
}

export interface AnalyticsState {
  data: StudentAnalytics | null;
  loading: boolean;
  error: string | null;
}

// ==================== Initial State ====================
const initialState: AnalyticsState = {
  data: null,
  loading: false,
  error: null,
};

// ==================== Async Thunks ====================
export const fetchStudentAnalytics = createAsyncThunk(
  'analytics/fetchStudentAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseServiceGet.getStudentAnalytics();
      return response.analytics;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch analytics');
    }
  }
);

// ==================== Slice Definition ====================
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchStudentAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ==================== Actions ====================
export const { clearAnalytics } = analyticsSlice.actions;

// ==================== Selectors ====================
export const selectAnalytics = (state: { analytics: AnalyticsState }) => state.analytics.data;
export const selectAnalyticsLoading = (state: { analytics: AnalyticsState }) => state.analytics.loading;
export const selectAnalyticsError = (state: { analytics: AnalyticsState }) => state.analytics.error;

// Derived data selectors
export const selectSubjectPerformance = (state: { analytics: AnalyticsState }) => 
  state.analytics.data?.subjectPerformance || [];

export const selectDifficultyPerformance = (state: { analytics: AnalyticsState }) => 
  state.analytics.data?.difficultyPerformance || [];

export const selectRecentPerformance = (state: { analytics: AnalyticsState }) => 
  state.analytics.data?.recentPerformance || [];

export const selectSummaryMetrics = (state: { analytics: AnalyticsState }) => {
  if (!state.analytics.data) return null;
  
  const { 
    totalAttempts, 
    averageScore, 
    correctAnswers, 
    incorrectAnswers, 
    unattempted 
  } = state.analytics.data;
  
  return {
    totalAttempts,
    averageScore,
    accuracy: correctAnswers / (correctAnswers + incorrectAnswers) * 100 || 0,
    attempted: correctAnswers + incorrectAnswers,
    unattempted
  };
};

// ==================== Reducer Export ====================
export default analyticsSlice.reducer;