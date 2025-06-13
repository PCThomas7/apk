import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChapterState {
  cache: Record<string, { chapters: string[]; timestamp: number }>; // key: DPP_Physics_NEET
}

const initialState: ChapterState = {
  cache: {},
};

const chapterSlice = createSlice({
  name: 'chapters',
  initialState,
  reducers: {
    setChapters(
      state,
      action: PayloadAction<{ key: string; chapters: string[]; timestamp: number }>
    ) {
      state.cache[action.payload.key] = {
        chapters: action.payload.chapters,
        timestamp: action.payload.timestamp,
      };
    },
  },
});

export const { setChapters } = chapterSlice.actions;
export default chapterSlice.reducer;
