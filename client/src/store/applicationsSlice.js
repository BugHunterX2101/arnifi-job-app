import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchApplications = createAsyncThunk('applications/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/applications');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch applications.');
  }
});

export const updateApplicationStatus = createAsyncThunk(
  'applications/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/applications/${id}/status`, { status });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update status.');
    }
  }
);

const applicationsSlice = createSlice({
  name: 'applications',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearApplicationsError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchApplications.fulfilled, (s, a) => { s.status = 'succeeded'; s.items = a.payload; })
      .addCase(fetchApplications.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; })
      .addCase(updateApplicationStatus.fulfilled, (s, a) => {
        const idx = s.items.findIndex((i) => i.id === a.payload.id);
        if (idx !== -1) s.items[idx].status = a.payload.status;
      });
  },
});

export const { clearApplicationsError } = applicationsSlice.actions;
export default applicationsSlice.reducer;
