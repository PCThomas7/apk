import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import courseServiceGet from '@/services/courseServiceGet';

type Course = {
  id: string;
  title: string;
  isEnrolled: boolean;
  thumbnail?: string;
  totalLessons?: number;
  completedLessons?: number;
};

type CourseState = {
  all: Course[];
  loading: boolean;
  error: string | null;
};

export const fetchCourses = createAsyncThunk<Course[]>(
  'courses/fetchCourses',
  async () => {
    return await courseServiceGet.getCoursesStudent();
  }
);

const initialState: CourseState = {
  all: [],
  loading: false,
  error: null,
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.all = action.payload;
        state.loading = false;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch courses';
      });
  },
});

export default courseSlice.reducer;
