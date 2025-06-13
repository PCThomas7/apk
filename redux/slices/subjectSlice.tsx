import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SubjectCacheEntry {
  groupedSubjects: Record<string, string[]>; // { NEET: [...], JEE: [...] }
  timestamp: number;
  route?: string; // Track which screen cached this
  filters?: {
    courseId?: string;
    category?: string;
    // Add other relevant filters
  };
}

interface SubjectState {
  // Separate cache for different quiz types
  dppSubjects: Record<string, SubjectCacheEntry>; // key = cacheKey (route_filters)
  shortExamSubjects: Record<string, SubjectCacheEntry>;
  
  // LRU tracking for cache management
  lruQueue: {
    dpp: string[];
    shortExam: string[];
  };
  
  maxCacheSize: number;
}

const initialState: SubjectState = {
  dppSubjects: {},
  shortExamSubjects: {},
  lruQueue: {
    dpp: [],
    shortExam: [],
  },
  maxCacheSize: 20, // Reasonable limit for subjects
};

// Helper function to generate cache keys
const generateSubjectCacheKey = (
  route?: string,
  courseId?: string,
  category?: string
): string => {
  const parts = [
    route || 'default',
    courseId || 'all',
    category || 'all'
  ];
  return parts.join('_');
};

// Helper function to get the correct cache store
const getSubjectCacheStore = (state: SubjectState, quizType: string) => {
  const normalizedType = quizType.toLowerCase().replace(/\s+/g, '');
  
  switch (normalizedType) {
    case 'dpp':
    case 'dailypracticeproblem':
      return {
        cache: state.dppSubjects,
        lru: state.lruQueue.dpp,
        setCacheEntry: (key: string, entry: SubjectCacheEntry) => {
          state.dppSubjects[key] = entry;
        },
        deleteCacheEntry: (key: string) => {
          delete state.dppSubjects[key];
        },
        updateLru: (newQueue: string[]) => {
          state.lruQueue.dpp = newQueue;
        }
      };
    
    case 'shortexam':
    case 'shortexamination':
      return {
        cache: state.shortExamSubjects,
        lru: state.lruQueue.shortExam,
        setCacheEntry: (key: string, entry: SubjectCacheEntry) => {
          state.shortExamSubjects[key] = entry;
        },
        deleteCacheEntry: (key: string) => {
          delete state.shortExamSubjects[key];
        },
        updateLru: (newQueue: string[]) => {
          state.lruQueue.shortExam = newQueue;
        }
      };
    
    default:
      throw new Error(`Unknown quiz type for subjects: ${quizType}`);
  }
};

const subjectSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    setSubjects(
      state,
      action: PayloadAction<{
        quizType: string;
        groupedSubjects: Record<string, string[]>;
        timestamp?: number;
        route?: string;
        filters?: {
          courseId?: string;
          category?: string;
        };
      }>
    ) {
      const {
        quizType,
        groupedSubjects,
        timestamp = Date.now(),
        route,
        filters
      } = action.payload;

      try {
        const cacheStore = getSubjectCacheStore(state, quizType);
        const cacheKey = generateSubjectCacheKey(route, filters?.courseId, filters?.category);

        // Create cache entry
        const cacheEntry: SubjectCacheEntry = {
          groupedSubjects,
          timestamp,
          route,
          filters
        };

        // Store in appropriate cache
        cacheStore.setCacheEntry(cacheKey, cacheEntry);

        // Update LRU queue
        const existingIndex = cacheStore.lru.indexOf(cacheKey);
        if (existingIndex !== -1) {
          cacheStore.lru.splice(existingIndex, 1);
        }
        cacheStore.lru.push(cacheKey);

        // Evict least recently used if over limit
        if (cacheStore.lru.length > state.maxCacheSize) {
          const evictKey = cacheStore.lru.shift();
          if (evictKey) {
            cacheStore.deleteCacheEntry(evictKey);
          }
        }
      } catch (error) {
        console.warn('Error setting subjects in cache:', error);
        
        // Fallback: store in a generic way (backward compatibility)
        const fallbackKey = `${quizType}_fallback`;
        state.dppSubjects[fallbackKey] = {
          groupedSubjects,
          timestamp,
          route,
          filters
        };
      }
    },

    // Get subjects with specific cache key
    getSubjects: (state, action: PayloadAction<{
      quizType: string;
      route?: string;
      filters?: {
        courseId?: string;
        category?: string;
      };
    }>) => {
      // This is handled by selectors, but keeping for consistency
    },

    // Merge subjects instead of replacing (useful for incremental loading)
    mergeSubjects(
      state,
      action: PayloadAction<{
        quizType: string;
        groupedSubjects: Record<string, string[]>;
        route?: string;
        filters?: {
          courseId?: string;
          category?: string;
        };
      }>
    ) {
      const { quizType, groupedSubjects, route, filters } = action.payload;

      try {
        const cacheStore = getSubjectCacheStore(state, quizType);
        const cacheKey = generateSubjectCacheKey(route, filters?.courseId, filters?.category);

        const existingEntry = cacheStore.cache[cacheKey];
        
        if (existingEntry) {
          // Merge with existing data
          const mergedSubjects = { ...existingEntry.groupedSubjects };
          
          Object.entries(groupedSubjects).forEach(([examType, subjects]) => {
            if (mergedSubjects[examType]) {
              // Merge and deduplicate subjects
              const existingSubjects = new Set(mergedSubjects[examType]);
              subjects.forEach(subject => existingSubjects.add(subject));
              mergedSubjects[examType] = Array.from(existingSubjects);
            } else {
              mergedSubjects[examType] = subjects;
            }
          });

          cacheStore.setCacheEntry(cacheKey, {
            ...existingEntry,
            groupedSubjects: mergedSubjects,
            timestamp: Date.now()
          });
        } else {
          // Create new entry if doesn't exist
          cacheStore.setCacheEntry(cacheKey, {
            groupedSubjects,
            timestamp: Date.now(),
            route,
            filters
          });
        }
      } catch (error) {
        console.warn('Error merging subjects:', error);
      }
    },

    // Clear subjects for specific quiz type and cache key
    clearSubjects(state, action: PayloadAction<{
      quizType: string;
      route?: string;
      filters?: {
        courseId?: string;
        category?: string;
      };
    }>) {
      const { quizType, route, filters } = action.payload;

      try {
        const cacheStore = getSubjectCacheStore(state, quizType);
        const cacheKey = generateSubjectCacheKey(route, filters?.courseId, filters?.category);

        cacheStore.deleteCacheEntry(cacheKey);
        const index = cacheStore.lru.indexOf(cacheKey);
        if (index !== -1) {
          cacheStore.lru.splice(index, 1);
        }
      } catch (error) {
        console.warn('Error clearing subjects:', error);
      }
    },

    // Clear all subjects for a quiz type
    clearSubjectsByType(state, action: PayloadAction<string>) {
      const quizType = action.payload;

      try {
        const cacheStore = getSubjectCacheStore(state, quizType);
        
        // Clear all cache entries
        Object.keys(cacheStore.cache).forEach(key => {
          cacheStore.deleteCacheEntry(key);
        });
        
        // Clear LRU queue
        cacheStore.updateLru([]);
      } catch (error) {
        console.warn('Error clearing subjects by type:', error);
      }
    },

    // Clear all subject caches
    clearAllSubjects(state) {
      state.dppSubjects = {};
      state.shortExamSubjects = {};
      state.lruQueue = {
        dpp: [],
        shortExam: [],
      };
    },

    // Clean expired subject cache entries
    cleanExpiredSubjects(state, action: PayloadAction<number>) {
      const maxAge = action.payload; // milliseconds
      const now = Date.now();

      const cleanCache = (cache: Record<string, SubjectCacheEntry>, lru: string[]) => {
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

      cleanCache(state.dppSubjects, state.lruQueue.dpp);
      cleanCache(state.shortExamSubjects, state.lruQueue.shortExam);
    },

    // Legacy support - for backward compatibility
    removeSubjectsByType(state, action: PayloadAction<string>) {
      // Map to new clearSubjectsByType action
      const quizType = action.payload;
      try {
        const cacheStore = getSubjectCacheStore(state, quizType);
        Object.keys(cacheStore.cache).forEach(key => {
          cacheStore.deleteCacheEntry(key);
        });
        cacheStore.updateLru([]);
      } catch (error) {
        console.warn('Error in legacy removeSubjectsByType:', error);
      }
    },
  },
});

// Selectors for accessing cached subject data
export const selectSubjectCache = (
  state: { subjects: SubjectState },
  quizType: string,
  route?: string,
  filters?: {
    courseId?: string;
    category?: string;
  }
): SubjectCacheEntry | undefined => {
  try {
    const cacheStore = getSubjectCacheStore(state.subjects, quizType);
    const cacheKey = generateSubjectCacheKey(route, filters?.courseId, filters?.category);
    return cacheStore.cache[cacheKey];
  } catch (error) {
    console.warn('Error selecting subject cache:', error);
    
    // Fallback: try to get from legacy cache structure
    const fallbackKey = `${quizType}_fallback`;
    return state.subjects.dppSubjects[fallbackKey];
  }
};

// Selector to check if subject cache is valid (not expired)
export const selectIsSubjectCacheValid = (
  state: { subjects: SubjectState },
  quizType: string,
  maxAge: number, // milliseconds
  route?: string,
  filters?: {
    courseId?: string;
    category?: string;
  }
): boolean => {
  const cachedData = selectSubjectCache(state, quizType, route, filters);
  if (!cachedData) return false;
  
  return Date.now() - cachedData.timestamp <= maxAge;
};

// Selector to get all subjects for a quiz type (across all cache keys)
export const selectAllSubjectsForType = (
  state: { subjects: SubjectState },
  quizType: string
): Record<string, string[]> => {
  try {
    const cacheStore = getSubjectCacheStore(state.subjects, quizType);
    const allSubjects: Record<string, string[]> = {};
    
    Object.values(cacheStore.cache).forEach(entry => {
      Object.entries(entry.groupedSubjects).forEach(([examType, subjects]) => {
        if (allSubjects[examType]) {
          // Merge and deduplicate
          const existingSubjects = new Set(allSubjects[examType]);
          subjects.forEach(subject => existingSubjects.add(subject));
          allSubjects[examType] = Array.from(existingSubjects);
        } else {
          allSubjects[examType] = [...subjects];
        }
      });
    });
    
    return allSubjects;
  } catch (error) {
    console.warn('Error selecting all subjects for type:', error);
    return {};
  }
};

export const { 
  setSubjects, 
  getSubjects,
  mergeSubjects,
  clearSubjects, 
  clearSubjectsByType,
  clearAllSubjects,
  cleanExpiredSubjects,
  removeSubjectsByType // Legacy support
} = subjectSlice.actions;

export default subjectSlice.reducer;
