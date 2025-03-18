import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import commentService from '../api/comment';
import { toast } from 'react-toastify';

// Async thunk fonksiyonları
export const createComment = createAsyncThunk(
  'comment/create',
  async (commentData, { rejectWithValue }) => {
    try {
      const response = await commentService.createComment(commentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateComment = createAsyncThunk(
  'comment/update',
  async ({ commentId, commentData }, { rejectWithValue }) => {
    try {
      const response = await commentService.updateComment(commentId, commentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comment/delete',
  async (commentId, { rejectWithValue }) => {
    try {
      await commentService.deleteComment(commentId);
      return commentId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const reactToComment = createAsyncThunk(
  'comment/react',
  async ({ commentId, reactionType }, { rejectWithValue }) => {
    try {
      const response = await commentService.reactToComment(commentId, reactionType);
      return { commentId, reactions: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Comment slice
const commentSlice = createSlice({
  name: 'comment',
  initialState: {
    comments: [],
    activeComment: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCommentError: (state) => {
      state.error = null;
    },
    setActiveComment: (state, action) => {
      state.activeComment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create comment states
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments.unshift(action.payload);
        toast.success('Yorum başarıyla eklendi');
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Yorum eklenemedi';
        toast.error(state.error);
      })
      
      // Update comment states
      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.comments.findIndex(comment => comment.comment_id === action.payload.comment_id);
        if (index !== -1) {
          state.comments[index] = action.payload;
        }
        toast.success('Yorum başarıyla güncellendi');
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Yorum güncellenemedi';
        toast.error(state.error);
      })
      
      // Delete comment states
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.filter(comment => comment.comment_id !== action.payload);
        toast.success('Yorum başarıyla silindi');
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Yorum silinemedi';
        toast.error(state.error);
      })
      
      // React to comment states
      .addCase(reactToComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reactToComment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.comments.findIndex(comment => comment.comment_id === action.payload.commentId);
        if (index !== -1) {
          state.comments[index].begeni_sayisi = action.payload.reactions.begeni_sayisi;
          state.comments[index].begenmeme_sayisi = action.payload.reactions.begenmeme_sayisi;
        }
      })
      .addCase(reactToComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Reaksiyon eklenemedi';
        toast.error(state.error);
      });
  },
});

export const { clearCommentError, setActiveComment } = commentSlice.actions;

export default commentSlice.reducer;