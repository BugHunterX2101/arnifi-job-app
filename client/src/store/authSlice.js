import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

const savedToken = localStorage.getItem('sovereign_token');
const savedUser = localStorage.getItem('sovereign_user');

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
    user: savedUser ? JSON.parse(savedUser) : null,
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
