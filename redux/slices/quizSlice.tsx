import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QuizMeta {
  id: string;
  title: string;
  duration: number;
  subject?: string;
  chapter?: string;
  examType?: string;
  difficulty?: string;
  totalQuestions?: number;
  // Add more fields as needed
}

interface QuizCacheEntry {
  quizzes: QuizMeta[];
  timestamp: number;
  route?: string; // Track which route/screen cached this data
  filters?: {
    subject?: string;
    chapter?: string;
    examType?: string;
  };
}

// Separate cache stores for different quiz types
interface QuizState {
  dppCache: Record<string, QuizCacheEntry>; // DPP quizzes
  mockExamCache: Record<string, QuizCacheEntry>; // Mock exam quizzes
  shortExamCache: Record<string, QuizCacheEntry>; // Short exam quizzes
  lruQueue: {
    dpp: string[];
    mockExam: string[];
    shortExam: string[];
  };
  maxCacheSize: number;
}

const initialState: QuizState = {
  dppCache: {},
  mockExamCache: {},
  shortExamCache: {},
  lruQueue: {
    dpp: [],
    mockExam: [],
    shortExam: [],
  },
  maxCacheSize: 50,
};

// Helper function to get the correct cache and LRU queue
const getCacheStore = (state: QuizState, quizType: string) => {
  switch (quizType.toLowerCase()) {
    case 'dpp':
    case 'daily practice problem':
      return {
        cache: state.dppCache,
        lru: state.lruQueue.dpp,
        setCacheEntry: (key: string, entry: QuizCacheEntry) => {
          state.dppCache[key] = entry;
        },
        deleteCacheEntry: (key: string) => {
          delete state.dppCache[key];
        },
        updateLru: (newQueue: string[]) => {
          state.lruQueue.dpp = newQueue;
        }
      };
    case 'mock exam':
    case 'mock examination':
      return {
        cache: state.mockExamCache,
        lru: state.lruQueue.mockExam,
        setCacheEntry: (key: string, entry: QuizCacheEntry) => {
          state.mockExamCache[key] = entry;
        },
        deleteCacheEntry: (key: string) => {
          delete state.mockExamCache[key];
        },
        updateLru: (newQueue: string[]) => {
          state.lruQueue.mockExam = newQueue;
        }
      };
    case 'short exam':
    case 'short examination':
      return {
        cache: state.shortExamCache,
        lru: state.lruQueue.shortExam,
        setCacheEntry: (key: string, entry: QuizCacheEntry) => {
          state.shortExamCache[key] = entry;
        },
        deleteCacheEntry: (key: string) => {
          delete state.shortExamCache[key];
        },
        updateLru: (newQueue: string[]) => {
          state.lruQueue.shortExam = newQueue;
        }
      };
    default:
      throw new Error(`Unknown quiz type: ${quizType}`);
  }
};

// Generate more specific cache keys
const generateCacheKey = (
  quizType: string,
  subject?: string,
  chapter?: string,
  examType?: string,
  route?: string
) => {
  const parts = [
    quizType.toLowerCase().replace(/\s+/g, '_'),
    subject || 'all',
    chapter || 'all',
    examType || 'all'
  ];
  
  // Add route information for additional uniqueness
  if (route) {
    parts.push(route);
  }
  
  return parts.join('_');
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
        route?: string; // Which screen/route is caching this
        timestamp?: number;
      }>
    ) {
      const { 
        quizType, 
        quizzes, 
        subject, 
        chapter, 
        examType, 
        route,
        timestamp = Date.now() 
      } = action.payload;

      try {
        const cacheStore = getCacheStore(state, quizType);
        const key = generateCacheKey(quizType, subject, chapter, examType, route);

        // Save quizzes to appropriate cache
        const cacheEntry: QuizCacheEntry = {
          quizzes,
          timestamp,
          route,
          filters: { subject, chapter, examType }
        };

        cacheStore.setCacheEntry(key, cacheEntry);

        // Update LRU queue
        const existingIndex = cacheStore.lru.indexOf(key);
        if (existingIndex !== -1) {
          cacheStore.lru.splice(existingIndex, 1);
        }
        cacheStore.lru.push(key);

        // Evict least recently used if over limit
        if (cacheStore.lru.length > state.maxCacheSize) {
          const evictKey = cacheStore.lru.shift();
          if (evictKey) {
            cacheStore.deleteCacheEntry(evictKey);
          }
        }
      } catch (error) {
        console.warn('Error setting quizzes in cache:', error);
      }
    },

    // Get quizzes from cache
    getQuizzes: (state, action: PayloadAction<{
      quizType: string;
      subject?: string;
      chapter?: string;
      examType?: string;
      route?: string;
    }>) => {
      // This is handled by selectors, but keeping for consistency
    },

    // Clear cache for specific quiz type
    clearQuizCache(state, action: PayloadAction<{
      quizType: string;
      subject?: string;
      chapter?: string;
      examType?: string;
      route?: string;
    }>) {
      const { quizType, subject, chapter, examType, route } = action.payload;
      
      try {
        const cacheStore = getCacheStore(state, quizType);
        const key = generateCacheKey(quizType, subject, chapter, examType, route);
        
        cacheStore.deleteCacheEntry(key);
        const index = cacheStore.lru.indexOf(key);
        if (index !== -1) {
          cacheStore.lru.splice(index, 1);
        }
      } catch (error) {
        console.warn('Error clearing quiz cache:', error);
      }
    },

    // Clear entire cache for a quiz type
    clearQuizTypeCache(state, action: PayloadAction<string>) {
      const quizType = action.payload;
      
      try {
        const cacheStore = getCacheStore(state, quizType);
        
        // Clear all entries
        Object.keys(cacheStore.cache).forEach(key => {
          cacheStore.deleteCacheEntry(key);
        });
        
        // Clear LRU queue
        cacheStore.updateLru([]);
      } catch (error) {
        console.warn('Error clearing quiz type cache:', error);
      }
    },

    // Clear all caches
    clearAllQuizCache(state) {
      state.dppCache = {};
      state.mockExamCache = {};
      state.shortExamCache = {};
      state.lruQueue = {
        dpp: [],
        mockExam: [],
        shortExam: [],
      };
    },

    // Clean expired cache entries
    cleanExpiredCache(state, action: PayloadAction<number>) {
      const maxAge = action.payload; // milliseconds
      const now = Date.now();

      const cleanCache = (cache: Record<string, QuizCacheEntry>, lru: string[]) => {
        const expiredKeys: string[] = [];
        
        Object.entries(cache).forEach(([key, entry]) => {
          if (now - entry.timestamp > maxAge) {
            expiredKeys.push(key);
          }
        });

        expiredKeys.forEach(key => {
          delete cache[key];
          const index = lru.indexOf(key);
          if (index !== -1) {
            lru.splice(index, 1);
          }
        });
      };

      cleanCache(state.dppCache, state.lruQueue.dpp);
      cleanCache(state.mockExamCache, state.lruQueue.mockExam);
      cleanCache(state.shortExamCache, state.lruQueue.shortExam);
    },
  },
});

// Selectors for getting cached data
export const selectQuizCache = (
  state: { quizzes: QuizState },
  quizType: string,
  subject?: string,
  chapter?: string,
  examType?: string,
  route?: string
): QuizCacheEntry | undefined => {
  try {
    const cacheStore = getCacheStore(state.quizzes, quizType);
    const key = generateCacheKey(quizType, subject, chapter, examType, route);
    return cacheStore.cache[key];
  } catch (error) {
    console.warn('Error selecting quiz cache:', error);
    return undefined;
  }
};

// Selector to check if cache is valid (not expired)
export const selectIsCacheValid = (
  state: { quizzes: QuizState },
  quizType: string,
  maxAge: number, // milliseconds
  subject?: string,
  chapter?: string,
  examType?: string,
  route?: string
): boolean => {
  const cachedData = selectQuizCache(state, quizType, subject, chapter, examType, route);
  if (!cachedData) return false;
  
  return Date.now() - cachedData.timestamp <= maxAge;
};

export const { 
  setQuizzes, 
  clearQuizCache, 
  clearQuizTypeCache,
  clearAllQuizCache,
  cleanExpiredCache 
} = quizSlice.actions;

export default quizSlice.reducer;