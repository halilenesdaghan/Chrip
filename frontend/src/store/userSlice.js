import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../api/user';
import { toast } from 'react-toastify';

// Async thunk fonksiyonları
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.getUser(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserByUsername = createAsyncThunk(
  'user/fetchUserByUsername',
  async (username, { rejectWithValue }) => {
    try {
      const response = await userService.getUserByUsername(username);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'user/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      await userService.deleteAccount();
      return true;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserForums = createAsyncThunk(
  'user/fetchForums',
  async ({ userId, page = 1, per_page = 10 }, { rejectWithValue }) => {
    try {
      const response = userId 
        ? await userService.getUserForums(userId, page, per_page)
        : await userService.getMyForums(page, per_page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserComments = createAsyncThunk(
  'user/fetchComments',
  async ({ userId, page = 1, per_page = 10 }, { rejectWithValue }) => {
    try {
      const response = userId 
        ? await userService.getUserComments(userId, page, per_page)
        : await userService.getMyComments(page, per_page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserPolls = createAsyncThunk(
  'user/fetchPolls',
  async ({ userId, page = 1, per_page = 10 }, { rejectWithValue }) => {
    try {
      const response = userId 
        ? await userService.getUserPolls(userId, page, per_page)
        : await userService.getMyPolls(page, per_page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserGroups = createAsyncThunk(
  'user/fetchGroups',
  async (userId, { rejectWithValue }) => {
    try {
      const response = userId 
        ? await userService.getUserGroups(userId)
        : await userService.getMyGroups();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    forums: [],
    comments: [],
    polls: [],
    groups: [],
    loading: false,
    error: null,
    forumsPagination: {
      page: 1,
      per_page: 10,
      total: 0,
      total_pages: 0
    },
    commentsPagination: {
      page: 1,
      per_page: 10,
      total: 0,
      total_pages: 0
    },
    pollsPagination: {
      page: 1,
      per_page: 10,
      total: 0,
      total_pages: 0
    }
  },
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    setForumsPage: (state, action) => {
      state.forumsPagination.page = action.payload;
    },
    setCommentsPage: (state, action) => {
      state.commentsPagination.page = action.payload;
    },
    setPollsPage: (state, action) => {
      state.pollsPagination.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user states
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Kullanıcı bulunamadı';
        toast.error(state.error);
      })
      
      // Fetch user by username states
      .addCase(fetchUserByUsername.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserByUsername.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserByUsername.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Kullanıcı bulunamadı';
        toast.error(state.error);
      })
      
      // Update profile states
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        toast.success('Profil başarıyla güncellendi');
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Profil güncellenemedi';
        toast.error(state.error);
      })
      
      // Delete account states
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
        state.profile = null;
        toast.success('Hesabınız başarıyla silindi');
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Hesap silinemedi';
        toast.error(state.error);
      })
      
      // Fetch user forums states
      .addCase(fetchUserForums.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserForums.fulfilled, (state, action) => {
        state.loading = false;
        state.forums = action.payload;
        state.forumsPagination = action.payload.meta?.pagination || state.forumsPagination;
      })
      .addCase(fetchUserForums.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Forumlar yüklenemedi';
        toast.error(state.error);
      })
      
      // Fetch user comments states
      .addCase(fetchUserComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
        state.commentsPagination = action.payload.meta?.pagination || state.commentsPagination;
      })
      .addCase(fetchUserComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Yorumlar yüklenemedi';
        toast.error(state.error);
      })
      
      // Fetch user polls states
      .addCase(fetchUserPolls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPolls.fulfilled, (state, action) => {
        state.loading = false;
        state.polls = action.payload;
        state.pollsPagination = action.payload.meta?.pagination || state.pollsPagination;
      })
      .addCase(fetchUserPolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Anketler yüklenemedi';
        toast.error(state.error);
      })
      
      // Fetch user groups states
      .addCase(fetchUserGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchUserGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gruplar yüklenemedi';
        toast.error(state.error);
      })
  },
});

export const { clearUserError, setForumsPage, setCommentsPage, setPollsPage } = userSlice.actions;

export default userSlice.reducer;