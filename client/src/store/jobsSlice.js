import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchJobs = createAsyncThunk('jobs/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/jobs');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch jobs.');
  }
});

export const fetchJobById = createAsyncThunk('jobs/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/jobs/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch job.');
  }
});

export const createJob = createAsyncThunk('jobs/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/jobs', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create job.');
  }
});

export const updateJob = createAsyncThunk('jobs/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/jobs/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update job.');
  }
});

export const deleteJob = createAsyncThunk('jobs/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/jobs/${id}`);
    return id; // returns the UUID string
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete job.');
  }
});

export const applyToJob = createAsyncThunk('jobs/apply', async ({ id, coverLetter }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/jobs/${id}/apply`, { coverLetter });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to apply.');
  }
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    items: [],
    selected: null,
    status: 'idle',
    error: null,
    applyStatus: 'idle',
    applyError: null,
  },
  reducers: {
    clearJobError(state) { state.error = null; },
    clearApplyStatus(state) { state.applyStatus = 'idle'; state.applyError = null; },
    clearSelected(state) { state.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchJobs.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchJobs.fulfilled, (s, a) => { s.status = 'succeeded'; s.items = a.payload; })
      .addCase(fetchJobs.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; })

      // fetchById
      .addCase(fetchJobById.pending, (s) => { s.status = 'loading'; })
      .addCase(fetchJobById.fulfilled, (s, a) => { s.status = 'succeeded'; s.selected = a.payload; })
      .addCase(fetchJobById.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; })

      // create
      .addCase(createJob.fulfilled, (s, a) => { s.items.unshift(a.payload); })

      // update — uses UUID id (not _id)
      .addCase(updateJob.fulfilled, (s, a) => {
        const idx = s.items.findIndex((j) => j.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
        if (s.selected?.id === a.payload.id) s.selected = a.payload;
      })

      // delete — payload is the UUID string returned by the thunk
      .addCase(deleteJob.fulfilled, (s, a) => {
        s.items = s.items.filter((j) => j.id !== a.payload);
        if (s.selected?.id === a.payload) s.selected = null;
      })

      // apply
      .addCase(applyToJob.pending, (s) => { s.applyStatus = 'loading'; s.applyError = null; })
      .addCase(applyToJob.fulfilled, (s) => { s.applyStatus = 'succeeded'; })
      .addCase(applyToJob.rejected, (s, a) => { s.applyStatus = 'failed'; s.applyError = a.payload; });
  },
});

export const { clearJobError, clearApplyStatus, clearSelected } = jobsSlice.actions;
export default jobsSlice.reducer;
