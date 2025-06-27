// import { configureStore } from '@reduxjs/toolkit';
// import subjectReducer from './slices/subjectSlice';
// import chapterReducer from './slices/chapterSlice';
// import quizReducer from './slices/quizSlice';

// export const store = configureStore({
//   reducer: {
//     subjects: subjectReducer,
//     chapters: chapterReducer,
//     quizzes: quizReducer,
//   },
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;


import { configureStore } from '@reduxjs/toolkit';
import subjectReducer from './slices/subjectSlice';
import chapterReducer from './slices/chapterSlice';
import quizReducer from './slices/quizSlice';
import quiz from './slices/quizAttemptSlice'
import { solutionReducer } from './slices/quizAttemptSlice';
import courseReducer from './slices/courseSlice';

export const store = configureStore({
  reducer: {
    subjects: subjectReducer,
    chapters: chapterReducer,
    quizzes: quizReducer,
    quiz: quiz,
    solution: solutionReducer,
    courses: courseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
