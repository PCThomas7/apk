// import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// interface QuizMeta {
//   id: string;
//   title: string;
//   quizType: string;
//   duration?: string;
//   content: string;
// }

// interface QuizCacheEntry {
//   quizzes: QuizMeta[];
//   timestamp: number;
// }

// interface QuizTypeCache {
//   [key: string]: QuizCacheEntry;
// }

// interface QuizState {
//   caches: {
//     dpp: QuizTypeCache;
//     mockExam: QuizTypeCache;
//     shortExam: QuizTypeCache;
//     // Add other quiz types as needed
//   };
//   lruQueues: {
//     dpp: string[];
//     mockExam: string[];
//     shortExam: string[];
//   };
//   maxCacheSize: number;
// }

// const initialState: QuizState = {
//   caches: {
//     dpp: {},
//     mockExam: {},
//     shortExam: {},
//   },
//   lruQueues: {
//     dpp: [],
//     mockExam: [],
//     shortExam: [],
//   },
//   maxCacheSize: 20, // Per quiz type
// };

// // Normalize quiz type for consistent cache keys
// const normalizeQuizType = (quizType: string): keyof QuizState['caches'] => {
//   const type = quizType.toLowerCase();
//   if (type.includes('dpp') || type.includes('daily')) return 'dpp';
//   if (type.includes('mock')) return 'mockExam';
//   if (type.includes('short')) return 'shortExam';
//   return 'dpp'; // default
// };

// // Generate cache key with quiz type and route
// const generateCacheKey = (route?: string) => {
//   return route || 'default';
// };

// const quizSlice = createSlice({
//   name: 'quizzes',
//   initialState,
//   reducers: {
//     setQuizzes(
//       state,
//       action: PayloadAction<{
//         quizType: string;
//         quizzes: QuizMeta[];
//         route?: string;
//       }>
//     ) {
//       const { quizType, quizzes, route } = action.payload;
//       const normalizedType = normalizeQuizType(quizType);
//       const cache = state.caches[normalizedType];
//       const lruQueue = state.lruQueues[normalizedType];
//       const key = generateCacheKey(route);

//       // Update cache
//       cache[key] = {
//         quizzes,
//         timestamp: Date.now(),
//       };

//       // Update LRU queue
//       const existingIndex = lruQueue.indexOf(key);
//       if (existingIndex !== -1) {
//         lruQueue.splice(existingIndex, 1);
//       }
//       lruQueue.push(key);

//       // Enforce max cache size
//       if (lruQueue.length > state.maxCacheSize) {
//         const evictKey = lruQueue.shift();
//         if (evictKey) {
//           delete cache[evictKey];
//         }
//       }
//     },

//     clearQuizCache(
//       state,
//       action: PayloadAction<{
//         quizType: string;
//         route?: string;
//       }>
//     ) {
//       const { quizType, route } = action.payload;
//       const normalizedType = normalizeQuizType(quizType);
//       const key = generateCacheKey(route);

//       delete state.caches[normalizedType][key];
//       state.lruQueues[normalizedType] = state.lruQueues[normalizedType].filter(
//         (k) => k !== key
//       );
//     },

//     clearQuizTypeCache(state, action: PayloadAction<string>) {
//       const normalizedType = normalizeQuizType(action.payload);
//       state.caches[normalizedType] = {};
//       state.lruQueues[normalizedType] = [];
//     },

//     clearAllQuizCache(state) {
//       Object.keys(state.caches).forEach((type) => {
//         state.caches[type as keyof QuizState['caches']] = {};
//         state.lruQueues[type as keyof QuizState['lruQueues']] = [];
//       });
//     },
//   },
// });

// // Selectors
// export const selectQuizCache = (
//   state: { quizzes: QuizState },
//   quizType: string,
//   route?: string
// ): QuizCacheEntry | undefined => {
//   const normalizedType = normalizeQuizType(quizType);
//   const key = generateCacheKey(route);
//   return state.quizzes.caches[normalizedType][key];
// };

// export const selectIsCacheValid = (
//   state: { quizzes: QuizState },
//   quizType: string,
//   maxAge: number,
//   route?: string
// ): boolean => {
//   const cachedData = selectQuizCache(state, quizType, route);
//   return cachedData ? Date.now() - cachedData.timestamp <= maxAge : false;
// };

// export const {
//   setQuizzes,
//   clearQuizCache,
//   clearQuizTypeCache,
//   clearAllQuizCache,
// } = quizSlice.actions;

// export default quizSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';

interface QuizMeta {
  _id: string;
  title: string;
  quizType: string;
  duration?: string;
  content: string;
  lock?:Boolean;
}

interface QuizCacheEntry {
  quizzes: QuizMeta[];
  timestamp: number;
}

interface QuizTypeCache {
  [key: string]: QuizCacheEntry;
}

interface QuizState {
  caches: {
    dpp: QuizTypeCache;
    mockExam: QuizTypeCache;
    shortExam: QuizTypeCache;
  };
  lruQueues: {
    dpp: string[];
    mockExam: string[];
    shortExam: string[];
  };
  maxCacheSize: number;
}

const initialState: QuizState = {
  caches: {
    dpp: {},
    mockExam: {},
    shortExam: {},
  },
  lruQueues: {
    dpp: [],
    mockExam: [],
    shortExam: [],
  },
  maxCacheSize: 20, // Per quiz type
};

const normalizeQuizType = (quizType: string): keyof QuizState['caches'] => {
  const type = quizType.toLowerCase();
  if (type.includes('mock')) return 'mockExam';
  if (type.includes('short')) return 'shortExam';
  return 'dpp'; // Default to DPP
};

const generateCacheKey = (
  quizType: string,
  subject?: string,
  chapter?: string,
  examType?: string
): string => {
  const normalizedType = normalizeQuizType(quizType);
  if (normalizedType === 'mockExam') {
    return `quizzes_${normalizedType}`;
  }
  return `quizzes_${normalizedType}_${subject}_${chapter}_${examType}`;
};

const quizSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {
    setQuizzes(
      state,
      action: PayloadAction<{
        quizType: string;
        quizzes: QuizMeta[];
        subject?: string;
        chapter?: string;
        examType?: string;
        lock?: Boolean;
      }>
    ) {
      const { quizType, quizzes, subject, chapter, examType } = action.payload;
      const normalizedType = normalizeQuizType(quizType);
      const key = generateCacheKey(quizType, subject, chapter, examType);

      // Update cache
      state.caches[normalizedType][key] = {
        quizzes,
        timestamp: Date.now(),
      };

      // Update LRU queue
      const lruQueue = state.lruQueues[normalizedType];
      const existingIndex = lruQueue.indexOf(key);
      if (existingIndex !== -1) {
        lruQueue.splice(existingIndex, 1);
      }
      lruQueue.push(key);

      // Enforce max cache size
      if (lruQueue.length > state.maxCacheSize) {
        const evictKey = lruQueue.shift();
        if (evictKey) {
          delete state.caches[normalizedType][evictKey];
        }
      }
    },
    clearQuizCache(
      state,
      action: PayloadAction<{
        quizType: string;
        subject?: string;
        chapter?: string;
        examType?: string;
        lock?: Boolean;
      }>
    ) {
      const { quizType, subject, chapter, examType } = action.payload;
      const normalizedType = normalizeQuizType(quizType);
      const key = generateCacheKey(quizType, subject, chapter, examType);

      delete state.caches[normalizedType][key];
      state.lruQueues[normalizedType] = state.lruQueues[normalizedType].filter(
        (k) => k !== key
      );
    },
    clearAllQuizCache(state) {
      Object.keys(state.caches).forEach((type) => {
        state.caches[type as keyof QuizState['caches']] = {};
        state.lruQueues[type as keyof QuizState['lruQueues']] = [];
      });
    },
  },
});

// Selectors
const selectCacheByType = createSelector(
  (state: { quizzes: QuizState }) => state.quizzes.caches,
  (_: unknown, quizType: string) => quizType,
  (caches, quizType) => {
    const normalizedType = normalizeQuizType(quizType);
    return caches[normalizedType];
  }
);

// Memoized selector for quiz cache
export const selectQuizCache = createSelector(
  [
    selectCacheByType,
    (_: unknown, quizType: string) => quizType,
    (_: unknown, _quizType: string, subject?: string | null) => subject,
    (_: unknown, _quizType: string, _subject?: string | null, chapter?: string | null) => chapter,
    (_: unknown, _quizType: string, _subject?: string | null, _chapter?: string | null, examType?: string | null) => examType
  ],
  (cache, quizType, subject, chapter, examType) => {
    const key = generateCacheKey(
      quizType,
      subject || undefined,
      chapter || undefined,
      examType || undefined
    );
    return cache[key]?.quizzes;
  }
);

// Memoized selector for cache validity
export const selectIsCacheValid = createSelector(
  [
    selectCacheByType,
    (_: unknown, quizType: string) => quizType,
    (_: unknown, _quizType: string, _maxAge: number, subject?: string) => subject,
    (_: unknown, _quizType: string, _maxAge: number, _subject?: string, chapter?: string) => chapter,
    (_: unknown, _quizType: string, _maxAge: number, _subject?: string, _chapter?: string, examType?: string) => examType,
    (_: unknown, _quizType: string, maxAge: number) => maxAge
  ],
  (cache, quizType, subject, chapter, examType, maxAge) => {
    const key = generateCacheKey(quizType, subject, chapter, examType);
    const entry = cache[key];
    return entry ? Date.now() - entry.timestamp <= maxAge : false;
  }
);
export const { setQuizzes, clearQuizCache, clearAllQuizCache } = quizSlice.actions;
export default quizSlice.reducer;