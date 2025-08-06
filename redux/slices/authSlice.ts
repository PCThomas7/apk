// redux/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  token: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  isLoading: true,
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.refreshToken = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { login, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;