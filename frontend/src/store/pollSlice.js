import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import pollService from '../api/poll';
import { toast } from 'react-toastify';

// Async thunk fonksiyonları
export const fetchPolls = createAsyncThunk(
  'poll/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await pollService.getAllPolls(
        filters?.page,
        filters?.per_page,
        filters?.kategori,
        filters?.universite,
        filters?.aktif
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchPoll = createAsyncThunk(
  'poll/fetchOne',
  async (pollId, { rejectWithValue }) => {
    try {
      const response = await pollService.getPoll(pollId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createPoll = createAsyncThunk(
  'poll/create',
  async (pollData, { rejectWithValue }) => {
    try {
      const response = await pollService.createPoll(pollData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updatePoll = createAsyncThunk(
  'poll/update',
  async ({ pollId, pollData }, { rejectWithValue }) => {
    try {
      const response = await pollService.updatePoll(pollId, pollData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deletePoll = createAsyncThunk(
  'poll/delete',
  async (pollId, { rejectWithValue }) => {
    try {
      await pollService.deletePoll(pollId);
      return pollId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const votePoll = createAsyncThunk(
  'poll/vote',
  async ({ pollId, optionId }, { rejectWithValue }) => {
    try {
      const response = await pollService.votePoll(pollId, optionId);
      return { pollId, voteResult: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchPollResults = createAsyncThunk(
  'poll/fetchResults',
  async (pollId, { rejectWithValue }) => {
    try {
      const response = await pollService.getPollResults(pollId);
      return { pollId, results: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Poll slice
const pollSlice = createSlice({
  name: 'poll',
  initialState: {
    polls: [],
    activePoll: null,
    results: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      per_page: 10,
      total: 0,
      total_pages: 0
    },
    userVote: null
  },
  reducers: {
    clearPollError: (state) => {
      state.error = null;
    },
    setActivePoll: (state, action) => {
      state.activePoll = action.payload;
    },
    setPollPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setUserVote: (state, action) => {
      state.userVote = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch polls states
      .addCase(fetchPolls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolls.fulfilled, (state, action) => {
        state.loading = false;
        state.polls = action.payload;
        state.pagination = action.payload.meta?.pagination || state.pagination;
      })
      .addCase(fetchPolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Anketler yüklenemedi';
        toast.error(state.error);
      })
      
      // Fetch single poll states
      .addCase(fetchPoll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPoll.fulfilled, (state, action) => {
        state.loading = false;
        state.activePoll = action.payload;
      })
      .addCase(fetchPoll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Anket bulunamadı';
        toast.error(state.error);
      })
      
      // Create poll states
      .addCase(createPoll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPoll.fulfilled, (state, action) => {
        state.loading = false;
        state.polls.unshift(action.payload);
        toast.success('Anket başarıyla oluşturuldu');
      })
      .addCase(createPoll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Anket oluşturulamadı';
        toast.error(state.error);
      })
      
      // Update poll states
      .addCase(updatePoll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePoll.fulfilled, (state, action) => {
        state.loading = false;
        // Update in polls list
        const index = state.polls.findIndex(poll => poll.poll_id === action.payload.poll_id);
        if (index !== -1) {
          state.polls[index] = action.payload;
        }
        // Update active poll if it's the same one
        if (state.activePoll && state.activePoll.poll_id === action.payload.poll_id) {
          state.activePoll = action.payload;
        }
        toast.success('Anket başarıyla güncellendi');
      })
      .addCase(updatePoll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Anket güncellenemedi';
        toast.error(state.error);
      })
      
      // Delete poll states
      .addCase(deletePoll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePoll.fulfilled, (state, action) => {
        state.loading = false;
        state.polls = state.polls.filter(poll => poll.poll_id !== action.payload);
        if (state.activePoll && state.activePoll.poll_id === action.payload) {
          state.activePoll = null;
        }
        toast.success('Anket başarıyla silindi');
      })
      .addCase(deletePoll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Anket silinemedi';
        toast.error(state.error);
      })
      
      // Vote poll states
      .addCase(votePoll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(votePoll.fulfilled, (state, action) => {
        state.loading = false;
        // Update the active poll if it's the same one
        if (state.activePoll && state.activePoll.poll_id === action.payload.pollId) {
          state.activePoll.secenekler = action.payload.voteResult.results;
        }
        // Set the user's vote
        state.userVote = action.payload.optionId;
        // Update results
        state.results = action.payload.voteResult.results;
        toast.success('Oyunuz başarıyla kaydedildi');
      })
      .addCase(votePoll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Oy kullanılamadı';
        toast.error(state.error);
      })
      
      // Fetch poll results states
      .addCase(fetchPollResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPollResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
      })
      .addCase(fetchPollResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Sonuçlar yüklenemedi';
        toast.error(state.error);
      });
  },
});

export const { clearPollError, setActivePoll, setPollPage, setUserVote } = pollSlice.actions;

export default pollSlice.reducer;