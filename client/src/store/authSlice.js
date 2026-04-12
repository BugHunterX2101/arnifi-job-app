import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

const savedToken = localStorage.getItem('sovereign_token');

// FIX: Wrap JSON.parse in try/catch — if the stored value is corrupted or
// tampered with, JSON.parse throws a SyntaxError which crashes the entire app
// on startup. Gracefully fall back to null instead.
let savedUser = null;
try {
  const raw = localStorage.getItem('sovereign_user');
  if (raw) savedUser = JSON.parse(raw);
} catch {
  localStorage.removeItem('sovereign_user');
  localStorage.removeItem('sovereign_token');
}

export const signupUser = createAsyncThunk('auth/signup', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/signup', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Signup failed.');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed.');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser,
    token: savedToken || null,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('sovereign_token');
      localStorage.removeItem('sovereign_user');
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const onPending = (state) => {
      state.status = 'loading';
      state.error = null;
    };
    const onFulfilled = (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('sovereign_token', action.payload.token);
      localStorage.setItem('sovereign_user', JSON.stringify(action.payload.user));
    };
    const onRejected = (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    };

    builder
      .addCase(signupUser.pending, onPending)
      .addCase(signupUser.fulfilled, onFulfilled)
      .addCase(signupUser.rejected, onRejected)
      .addCase(loginUser.pending, onPending)
      .addCase(loginUser.fulfilled, onFulfilled)
      .addCase(loginUser.rejected, onRejected);
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
