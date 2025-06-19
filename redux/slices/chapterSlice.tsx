// import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// interface Chapter {
//   id: string;
//   name: string;
// }

// interface ChapterState {
//   cache: {
//     [key: string]: {
//       data: Chapter[];
//       timestamp: number;
//       isLoading: boolean;
//       error: string | null;
//     };
//   };
// }

// const initialState: ChapterState = {
//   cache: {},
// };

// const chapterSlice = createSlice({
//   name: 'chapters',
//   initialState,
//   reducers: {
//     fetchChaptersStart(state, action: PayloadAction<{ key: string }>) {
//       const { key } = action.payload;
//       if (!state.cache[key]) {
//         state.cache[key] = {
//           data: [],
//           timestamp: 0,
//           isLoading: true,
//           error: null,
//         };
//       } else {
//         state.cache[key].isLoading = true;
//         state.cache[key].error = null;
//       }
//     },
//     fetchChaptersSuccess(
//       state,
//       action: PayloadAction<{ key: string; data: Chapter[] }>
//     ) {
//       const { key, data } = action.payload;
//       state.cache[key] = {
//         data,
//         timestamp: Date.now(),
//         isLoading: false,
//         error: null,
//       };
//     },
//     fetchChaptersFailure(
//       state,
//       action: PayloadAction<{ key: string; error: string }>
//     ) {
//       const { key, error } = action.payload;
//       state.cache[key].isLoading = false;
//       state.cache[key].error = error;
//     },
//   },
// });

// export const {
//   fetchChaptersStart,
//   fetchChaptersSuccess,
//   fetchChaptersFailure,
// } = chapterSlice.actions;

// export const selectChapters = (state: any, key: string) =>
//   state.chapters.cache[key]?.data || [];

// export const selectChapterState = (state: any, key: string) => ({
//   isLoading: state.chapters.cache[key]?.isLoading ?? false,
//   error: state.chapters.cache[key]?.error ?? null,
// });

// export const isChapterCacheValid = (
//   state: any,
//   key: string,
//   expiry: number
// ) => {
//   const entry = state.chapters.cache[key];
//   return entry && !entry.isLoading && Date.now() - entry.timestamp < expiry;
// };

// export default chapterSlice.reducer;

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

interface Chapter {
  id: string;
  name: string;
}

interface ChapterState {
  cache: {
    [key: string]: {
      data: Chapter[];
      timestamp: number;
      isLoading: boolean;
      error: string | null;
    };
  };
}

const initialState: ChapterState = {
  cache: {},
};

const chapterSlice = createSlice({
  name: 'chapters',
  initialState,
  reducers: {
    fetchChaptersStart(state, action: PayloadAction<{ key: string }>) {
      const { key } = action.payload;
      if (!state.cache[key]) {
        state.cache[key] = {
          data: [],
          timestamp: 0,
          isLoading: true,
          error: null,
        };
      } else {
        state.cache[key].isLoading = true;
        state.cache[key].error = null;
      }
    },
    fetchChaptersSuccess(
      state,
      action: PayloadAction<{ key: string; data: Chapter[] }>
    ) {
      const { key, data } = action.payload;
      state.cache[key] = {
        data,
        timestamp: Date.now(),
        isLoading: false,
        error: null,
      };
    },
    fetchChaptersFailure(
      state,
      action: PayloadAction<{ key: string; error: string }>
    ) {
      const { key, error } = action.payload;
      state.cache[key].isLoading = false;
      state.cache[key].error = error;
    },
  },
});

// Memoized selectors
const selectChapterCache = (state: { chapters: ChapterState }) => state.chapters.cache;

export const selectChapters = createSelector(
  [selectChapterCache, (_: any, key: string) => key],
  (cache, key) => cache[key]?.data || []
);

export const selectChapterState = createSelector(
  [selectChapterCache, (_: any, key: string) => key],
  (cache, key) => ({
    isLoading: cache[key]?.isLoading ?? false,
    error: cache[key]?.error ?? null,
  })
);

// export const isChapterCacheValid = createSelector(
//   [
//     selectChapterCache,
//     (_: any, key: string) => key,
//     (_: any, _key: string, expiry: number) => expiry,
//     (_: any, _key: string, _expiry: number) => Date.now()
//   ],
//   (cache, key, expiry, currentTime) => {
//     const entry = cache[key];
//     return entry && !entry.isLoading && currentTime - entry.timestamp < expiry;
//   }
// );

export const isChapterCacheValid = (
  state: { chapters: ChapterState },
  key: string,
  expiry: number,
  currentTime: number
): boolean => {
  const entry = state.chapters.cache[key];
  return !!entry && !entry.isLoading && currentTime - entry.timestamp < expiry;
};

export const {
  fetchChaptersStart,
  fetchChaptersSuccess,
  fetchChaptersFailure,
} = chapterSlice.actions;

export default chapterSlice.reducer;