import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants';
import type { User } from '@/types';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
}

// Load user from localStorage on initialization
const getInitialUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
};

const initialState: UserState = {
  user: getInitialUser(),
  isAuthenticated: !!getInitialUser(),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(action.payload));
        localStorage.setItem(STORAGE_KEYS.USER_ID, action.payload._id);
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.USER_ID);
      }
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;

