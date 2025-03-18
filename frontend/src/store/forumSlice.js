import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import forumService from '../api/forum';
import { toast } from 'react-toastify';

// Async thunk fonksiyonları
export const fetchForums = createAsyncThunk(
  'forum/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await forumService.getAllForums(
        filters?.page,
        filters?.per_page,
        filters?.kategori,
        filters?.universite,
        filters?.search
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchForum = createAsyncThunk(
  'forum/fetchOne',
  async (forumId, { rejectWithValue }) => {
    try {
      const response = await forumService.getForum(forumId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createForum = createAsyncThunk(
  'forum/create',
  async (forumData, { rejectWithValue }) => {
    try {
      const response = await forumService.createForum(forumData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateForum = createAsyncThunk(
  'forum/update',
  async ({ forumId, forumData }, { rejectWithValue }) => {
    try {
      const response = await forumService.updateForum(forumId, forumData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteForum = createAsyncThunk(
  'forum/delete',
  async (forumId, { rejectWithValue }) => {
    try {
      await forumService.deleteForum(forumId);
      return forumId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchForumComments = createAsyncThunk(
  'forum/fetchComments',
  async ({ forumId, page, per_page }, { rejectWithValue }) => {
    try {
      const response = await forumService.getForumComments(forumId, page, per_page);
      return { forumId, comments: response.data, meta: response.meta };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const reactToForum = createAsyncThunk(
  'forum/react',
  async ({ forumId, reactionType }, { rejectWithValue }) => {
    try {
      const response = await forumService.reactToForum(forumId, reactionType);
      return { forumId, reactions: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Forum slice
const forumSlice = createSlice({
  name: 'forum',
  initialState: {
    forums: [],
    activeForum: null,
    comments: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      per_page: 10,
      total: 0,
      total_pages: 0
    },
  },
  reducers: {
    clearForumError: (state) => {
      state.error = null;
    },
    setActiveForum: (state, action) => {
      state.activeForum = action.payload;
    },
    setForumPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch forums states
      .addCase(fetchForums.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForums.fulfilled, (state, action) => {
        state.loading = false;
        state.forums = action.payload;
        state.pagination = action.payload.meta?.pagination || state.pagination;
      })
      .addCase(fetchForums.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Forumlar yüklenemedi';
        toast.error(state.error);
      })
      
      // Fetch single forum states
      .addCase(fetchForum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForum.fulfilled, (state, action) => {
        state.loading = false;
        state.activeForum = action.payload;
      })
      .addCase(fetchForum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Forum bulunamadı';
        toast.error(state.error);
      })
      
      // Create forum states
      .addCase(createForum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createForum.fulfilled, (state, action) => {
        state.loading = false;
        state.forums.unshift(action.payload);
        toast.success('Forum başarıyla oluşturuldu');
      })
      .addCase(createForum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Forum oluşturulamadı';
        toast.error(state.error);
      })
      
      // Update forum states
      .addCase(updateForum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateForum.fulfilled, (state, action) => {
        state.loading = false;
        // Update in forums list
        const index = state.forums.findIndex(forum => forum.forum_id === action.payload.forum_id);
        if (index !== -1) {
          state.forums[index] = action.payload;
        }
        // Update active forum if it's the same one
        if (state.activeForum && state.activeForum.forum_id === action.payload.forum_id) {
          state.activeForum = action.payload;
        }
        toast.success('Forum başarıyla güncellendi');
      })
      .addCase(updateForum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Forum güncellenemedi';
        toast.error(state.error);
      })
      
      // Delete forum states
      .addCase(deleteForum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteForum.fulfilled, (state, action) => {
        state.loading = false;
        state.forums = state.forums.filter(forum => forum.forum_id !== action.payload);
        if (state.activeForum && state.activeForum.forum_id === action.payload) {
          state.activeForum = null;
        }
        toast.success('Forum başarıyla silindi');
      })
      .addCase(deleteForum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Forum silinemedi';
        toast.error(state.error);
      })
      
      // Fetch forum comments states
      .addCase(fetchForumComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForumComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload.comments;
      })
      .addCase(fetchForumComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Yorumlar yüklenemedi';
        toast.error(state.error);
      })
      
      // React to forum states
      .addCase(reactToForum.fulfilled, (state, action) => {
        const { forumId, reactions } = action.payload;
        // Update in forums list
        const index = state.forums.findIndex(forum => forum.forum_id === forumId);
        if (index !== -1) {
          state.forums[index].begeni_sayisi = reactions.begeni_sayisi;
          state.forums[index].begenmeme_sayisi = reactions.begenmeme_sayisi;
        }
        // Update active forum if it's the same one
        if (state.activeForum && state.activeForum.forum_id === forumId) {
          state.activeForum.begeni_sayisi = reactions.begeni_sayisi;
          state.activeForum.begenmeme_sayisi = reactions.begenmeme_sayisi;
        }
      });
  },
});

export const { clearForumError, setActiveForum, setForumPage } = forumSlice.actions;

export default forumSlice.reducer;