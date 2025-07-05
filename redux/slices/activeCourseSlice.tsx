import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ActiveCourse = {
  id: string;
  title: string;
  isEnrolled: boolean;
  thumbnail?: string;
  totalLessons?: number;
  completedLessons?: number;
} | null;

interface ActiveCourseState {
  current: ActiveCourse;
}

const initialState: ActiveCourseState = {
  current: null,
};

const activeCourseSlice = createSlice({
  name: 'activeCourse',
  initialState,
  reducers: {
    setActiveCourse: (state, action: PayloadAction<ActiveCourse>) => {
      state.current = action.payload;
    },
    clearActiveCourse: (state) => {
      state.current = null;
    },
  },
});

export const { setActiveCourse, clearActiveCourse } = activeCourseSlice.actions;
export default activeCourseSlice.reducer;
