// quizReportSlice.ts
import { createSlice, PayloadAction, createAsyncThunk , createSelector } from '@reduxjs/toolkit';
import courseServiceGet from "../../services/courseServiceGet";

// Interfaces
export interface PerformanceMetrics {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unattempted: number;
    score: number;
    maxScore: number;
    percentage: number;
    timeSpent?: number;
}

export interface SubjectPerformance extends PerformanceMetrics {
    subject: string;
}

export interface ChapterPerformance extends PerformanceMetrics {
    chapter: string;
    subject: string;
}

export interface TopicPerformance extends PerformanceMetrics {
    topic: string;
    chapter: string;
    subject: string;
}

export interface DifficultyPerformance extends PerformanceMetrics {
    difficulty: string;
}

export interface QuestionTypePerformance extends PerformanceMetrics {
    questionType: string;
}

export interface QuizReport {
    overallPerformance: PerformanceMetrics;
    subjectWisePerformance: SubjectPerformance[];
    chapterWisePerformance: ChapterPerformance[];
    topicWisePerformance: TopicPerformance[];
    difficultyWisePerformance: DifficultyPerformance[];
    questionTypePerformance: QuestionTypePerformance[];
}

export interface QuizReportState {
    report: QuizReport | null;
    loading: boolean;
    error: string | null;
    attemptId: string | null;
}

// Initial state
const initialState: QuizReportState = {
    report: null,
    loading: false,
    error: null,
    attemptId: null,
};

// Thunk for fetching quiz report
export const fetchQuizReport = createAsyncThunk(
    'quizReport/fetchQuizReport',
    async (quizId: string, { rejectWithValue }) => {
        try {
            const response = await courseServiceGet.getQuizAttemptReport(quizId);
            if (response.message === "Detailed quiz report fetched successfully") {
                return {
                    report: response.report,
                    attemptId: response.attemptId
                };
            }
            throw new Error(response.message || 'Failed to fetch quiz report');
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const quizReportSlice = createSlice({
    name: 'quizReport',
    initialState,
    reducers: {
        clearQuizReport(state) {
            state.report = null;
            state.attemptId = null;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuizReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchQuizReport.fulfilled, (state, action: PayloadAction<{
                report: QuizReport;
                attemptId: string;
            }>) => {
                state.loading = false;
                state.report = action.payload.report;
                state.attemptId = action.payload.attemptId;
            })
            .addCase(fetchQuizReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

// Actions
export const { clearQuizReport } = quizReportSlice.actions;

// Selectors
export const selectOverallPerformance = (state: { quizReport: QuizReportState }) => 
    state.quizReport.report?.overallPerformance;

export const selectSubjectWisePerformance = createSelector(
  (state: { quizReport: QuizReportState }) => state.quizReport.report?.subjectWisePerformance,
  (subjectWisePerformance) => [...(subjectWisePerformance || [])]
);

export const selectChapterWisePerformance = createSelector(
  (state: { quizReport: QuizReportState }) => state.quizReport.report?.chapterWisePerformance,
  (chapterWisePerformance) => [...(chapterWisePerformance || [])]
);

export const selectTopicWisePerformance = createSelector(
  (state: { quizReport: QuizReportState }) => state.quizReport.report?.topicWisePerformance,
  (topicWisePerformance) => [...(topicWisePerformance || [])]
);

export const selectDifficultyWisePerformance = (state: { quizReport: QuizReportState }) => 
    state.quizReport.report?.difficultyWisePerformance || [];

export const selectQuestionTypePerformance = (state: { quizReport: QuizReportState }) => 
    state.quizReport.report?.questionTypePerformance || [];

export const selectQuizReportLoading = (state: { quizReport: QuizReportState }) => 
    state.quizReport.loading;

export const selectQuizReportError = (state: { quizReport: QuizReportState }) => 
    state.quizReport.error;

export const selectAttemptId = (state: { quizReport: QuizReportState }) => 
    state.quizReport.attemptId;

export default quizReportSlice.reducer;