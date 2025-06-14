import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Subject {
  id: string;
  name: string;
}

interface ExamTypeSubjects {
  examType: string;
  subjects: Subject[];
}

interface SubjectCacheEntry {
  examSubjects: ExamTypeSubjects[];
  timestamp: number;
  route?: string;
  filters?: {
    courseId?: string;
    category?: string;
  };
}

interface QuizTypeCache {
  [key: string]: SubjectCacheEntry;
}

interface SubjectState {
  caches: {
    dpp: QuizTypeCache;
    shortExam: QuizTypeCache;
  };
  lruQueues: {
    dpp: string[];
    shortExam: string[];
  };
  maxCacheSize: number;
}

const initialState: SubjectState = {
  caches: {
    dpp: {},
    shortExam: {},
  },
  lruQueues: {
    dpp: [],
    shortExam: [],
  },
  maxCacheSize: 15,
};

const normalizeQuizType = (quizType: string): keyof SubjectState['caches'] => {
  const type = quizType.toLowerCase();
  if (type.includes('dpp') || type.includes('daily')) return 'dpp';
  if (type.includes('short')) return 'shortExam';
  throw new Error(`Unsupported quiz type for subjects: ${quizType}`);
};

const generateCacheKey = (
  route?: string,
  courseId?: string,
  category?: string
): string => {
  return [route || 'default', courseId || 'all', category || 'all'].join('|');
};

const subjectSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    setSubjects: {
      reducer(
        state,
        action: PayloadAction<{
          quizType: string;
          examSubjects: ExamTypeSubjects[];
          route?: string;
          filters?: {
            courseId?: string;
            category?: string;
          };
          timestamp: number;
        }>
      ) {
        const { quizType, examSubjects, route, filters, timestamp } = action.payload;
        const normalizedType = normalizeQuizType(quizType);
        const cache = state.caches[normalizedType];
        const lruQueue = state.lruQueues[normalizedType];
        const cacheKey = generateCacheKey(route, filters?.courseId, filters?.category);

        cache[cacheKey] = {
          examSubjects,
          timestamp,
          route,
          filters
        };

        const existingIndex = lruQueue.indexOf(cacheKey);
        if (existingIndex !== -1) {
          lruQueue.splice(existingIndex, 1);
        }
        lruQueue.push(cacheKey);

        if (lruQueue.length > state.maxCacheSize) {
          const evictKey = lruQueue.shift();
          if (evictKey) {
            delete cache[evictKey];
          }
        }
      },
      prepare(payload: {
        quizType: string;
        examSubjects: ExamTypeSubjects[];
        route?: string;
        filters?: {
          courseId?: string;
          category?: string;
        };
      }) {
        return {
          payload: {
            ...payload,
            timestamp: Date.now()
          }
        };
      }
    },

    mergeSubjects: {
      reducer(
        state,
        action: PayloadAction<{
          quizType: string;
          examSubjects: ExamTypeSubjects[];
          route?: string;
          filters?: {
            courseId?: string;
            category?: string;
          };
          timestamp: number;
        }>
      ) {
        const { quizType, examSubjects, route, filters } = action.payload;
        const normalizedType = normalizeQuizType(quizType);
        const cache = state.caches[normalizedType];
        const lruQueue = state.lruQueues[normalizedType];
        const cacheKey = generateCacheKey(route, filters?.courseId, filters?.category);

        const existingEntry = cache[cacheKey];
        
        if (existingEntry) {
          const mergedExamSubjects = [...existingEntry.examSubjects];
          
          examSubjects.forEach(newExamType => {
            const existingExamIndex = mergedExamSubjects.findIndex(
              e => e.examType === newExamType.examType
            );
            
            if (existingExamIndex >= 0) {
              const existingSubjects = mergedExamSubjects[existingExamIndex].subjects;
              const newSubjectsMap = new Map(newExamType.subjects.map(s => [s.id, s]));
              
              const mergedSubjects = [...existingSubjects];
              newSubjectsMap.forEach((subject, id) => {
                if (!existingSubjects.some(s => s.id === id)) {
                  mergedSubjects.push(subject);
                }
              });
              
              mergedExamSubjects[existingExamIndex] = {
                ...mergedExamSubjects[existingExamIndex],
                subjects: mergedSubjects
              };
            } else {
              mergedExamSubjects.push(newExamType);
            }
          });

          cache[cacheKey] = {
            ...existingEntry,
            examSubjects: mergedExamSubjects,
            timestamp: Date.now()
          };
        } else {
          cache[cacheKey] = {
            examSubjects,
            timestamp: Date.now(),
            route,
            filters
          };
        }

        const lruIndex = lruQueue.indexOf(cacheKey);
        if (lruIndex >= 0) lruQueue.splice(lruIndex, 1);
        lruQueue.push(cacheKey);
      },
      prepare(payload: {
        quizType: string;
        examSubjects: ExamTypeSubjects[];
        route?: string;
        filters?: {
          courseId?: string;
          category?: string;
        };
      }) {
        return {
          payload: {
            ...payload,
            timestamp: Date.now()
          }
        };
      }
    },

    clearSubjects(
      state,
      action: PayloadAction<{
        quizType: string;
        route?: string;
        filters?: {
          courseId?: string;
          category?: string;
        };
      }>
    ) {
      const { quizType, route, filters } = action.payload;
      const normalizedType = normalizeQuizType(quizType);
      const cacheKey = generateCacheKey(route, filters?.courseId, filters?.category);

      delete state.caches[normalizedType][cacheKey];
      state.lruQueues[normalizedType] = state.lruQueues[normalizedType].filter(
        key => key !== cacheKey
      );
    },

    clearAllSubjects(state) {
      state.caches.dpp = {};
      state.caches.shortExam = {};
      state.lruQueues.dpp = [];
      state.lruQueues.shortExam = [];
    },

    cleanExpiredSubjects(state, action: PayloadAction<number>) {
      const maxAge = action.payload;
      const now = Date.now();

      const cleanCache = (cache: QuizTypeCache, lruQueue: string[]) => {
        const expiredKeys = Object.entries(cache)
          .filter(([_, entry]) => now - entry.timestamp > maxAge)
          .map(([key]) => key);

        expiredKeys.forEach(key => {
          delete cache[key];
          const index = lruQueue.indexOf(key);
          if (index !== -1) {
            lruQueue.splice(index, 1);
          }
        });
      };

      cleanCache(state.caches.dpp, state.lruQueues.dpp);
      cleanCache(state.caches.shortExam, state.lruQueues.shortExam);
    }
  }
});

// Selectors
export const selectSubjectCacheEntry = (
  state: { subjects: SubjectState },
  quizType: string,
  route?: string,
  filters?: {
    courseId?: string;
    category?: string;
  }
): SubjectCacheEntry | null => {
  try {
    const normalizedType = normalizeQuizType(quizType);
    const cacheKey = generateCacheKey(route, filters?.courseId, filters?.category);
    return state.subjects.caches[normalizedType][cacheKey] || null;
  } catch {
    return null;
  }
};

export const selectSubjectCache = (
  state: { subjects: SubjectState },
  quizType: string,
  route?: string,
  filters?: {
    courseId?: string;
    category?: string;
  }
): ExamTypeSubjects[] | null => {
  const entry = selectSubjectCacheEntry(state, quizType, route, filters);
  return entry?.examSubjects || null;
};

export const selectIsSubjectCacheValid = (
  state: { subjects: SubjectState },
  quizType: string,
  maxAge: number,
  route?: string,
  filters?: {
    courseId?: string;
    category?: string;
  }
): boolean => {
  const cachedEntry = selectSubjectCacheEntry(state, quizType, route, filters);
  return cachedEntry ? Date.now() - cachedEntry.timestamp <= maxAge : false;
};

export const selectSubjectsForExamType = (
  state: { subjects: SubjectState },
  quizType: string,
  examType: string,
  route?: string,
  filters?: {
    courseId?: string;
    category?: string;
  }
): Subject[] | null => {
  const allSubjects = selectSubjectCache(state, quizType, route, filters);
  if (!allSubjects) return null;

  const examSubjects = allSubjects.find(e => e.examType === examType);
  return examSubjects ? examSubjects.subjects : null;
};

export const {
  setSubjects,
  mergeSubjects,
  clearSubjects,
  clearAllSubjects,
  cleanExpiredSubjects
} = subjectSlice.actions;

export default subjectSlice.reducer;

