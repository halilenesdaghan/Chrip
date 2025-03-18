import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import groupService from '../api/group';
import { toast } from 'react-toastify';

// Async thunk fonksiyonları
export const fetchGroups = createAsyncThunk(
  'group/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await groupService.getAllGroups(
        filters?.page,
        filters?.per_page,
        filters?.search,
        filters?.kategoriler
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchGroup = createAsyncThunk(
  'group/fetchOne',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await groupService.getGroup(groupId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createGroup = createAsyncThunk(
  'group/create',
  async (groupData, { rejectWithValue }) => {
    try {
      const response = await groupService.createGroup(groupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateGroup = createAsyncThunk(
  'group/update',
  async ({ groupId, groupData }, { rejectWithValue }) => {
    try {
      const response = await groupService.updateGroup(groupId, groupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'group/delete',
  async (groupId, { rejectWithValue }) => {
    try {
      await groupService.deleteGroup(groupId);
      return groupId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const joinGroup = createAsyncThunk(
  'group/join',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await groupService.joinGroup(groupId);
      return { groupId, joinResult: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const leaveGroup = createAsyncThunk(
  'group/leave',
  async (groupId, { rejectWithValue }) => {
    try {
      await groupService.leaveGroup(groupId);
      return groupId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchGroupMembers = createAsyncThunk(
  'group/fetchMembers',
  async ({ groupId, page, per_page, status, role }, { rejectWithValue }) => {
    try {
      const response = await groupService.getGroupMembers(groupId, page, per_page, status, role);
      return { groupId, members: response.data, meta: response.meta };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateMemberRole = createAsyncThunk(
  'group/updateMemberRole',
  async ({ groupId, userId, role }, { rejectWithValue }) => {
    try {
      const response = await groupService.updateMemberRole(groupId, userId, role);
      return { groupId, userId, role: response.data.role };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const approveMembership = createAsyncThunk(
  'group/approveMembership',
  async ({ groupId, userId, approve }, { rejectWithValue }) => {
    try {
      const response = await groupService.approveMembership(groupId, userId, approve);
      return { groupId, userId, approved: approve, result: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Group slice
const groupSlice = createSlice({
  name: 'group',
  initialState: {
    groups: [],
    activeGroup: null,
    members: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      per_page: 10,
      total: 0,
      total_pages: 0
    },
    membersPagination: {
      page: 1,
      per_page: 20,
      total: 0,
      total_pages: 0
    }
  },
  reducers: {
    clearGroupError: (state) => {
      state.error = null;
    },
    setActiveGroup: (state, action) => {
      state.activeGroup = action.payload;
    },
    setGroupPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setMembersPage: (state, action) => {
      state.membersPagination.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch groups states
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
        state.pagination = action.payload.meta?.pagination || state.pagination;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gruplar yüklenemedi';
        toast.error(state.error);
      })
      
      // Fetch single group states
      .addCase(fetchGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.activeGroup = action.payload;
      })
      .addCase(fetchGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Grup bulunamadı';
        toast.error(state.error);
      })
      
      // Create group states
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.unshift(action.payload);
        toast.success('Grup başarıyla oluşturuldu');
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Grup oluşturulamadı';
        toast.error(state.error);
      })
      
      // Update group states
      .addCase(updateGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.loading = false;
        // Update in groups list
        const index = state.groups.findIndex(group => group.group_id === action.payload.group_id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
        // Update active group if it's the same one
        if (state.activeGroup && state.activeGroup.group_id === action.payload.group_id) {
          state.activeGroup = action.payload;
        }
        toast.success('Grup başarıyla güncellendi');
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Grup güncellenemedi';
        toast.error(state.error);
      })
      
      // Delete group states
      .addCase(deleteGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = state.groups.filter(group => group.group_id !== action.payload);
        if (state.activeGroup && state.activeGroup.group_id === action.payload) {
          state.activeGroup = null;
        }
        toast.success('Grup başarıyla silindi');
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Grup silinemedi';
        toast.error(state.error);
      })
      
      // Join group states
      .addCase(joinGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinGroup.fulfilled, (state, action) => {
        state.loading = false;
        toast.success(action.payload.joinResult.message);
        // If we have the active group, update it
        if (state.activeGroup && state.activeGroup.group_id === action.payload.groupId) {
          state.activeGroup.membership_status = action.payload.joinResult.membership_status;
        }
      })
      .addCase(joinGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gruba katılınamadı';
        toast.error(state.error);
      })
      
      // Leave group states
      .addCase(leaveGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.loading = false;
        toast.success('Gruptan başarıyla ayrıldınız');
        // If we have the active group, update it
        if (state.activeGroup && state.activeGroup.group_id === action.payload) {
          state.activeGroup.membership_status = null;
        }
      })
      .addCase(leaveGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gruptan ayrılınamadı';
        toast.error(state.error);
      })
      
      // Fetch group members states
      .addCase(fetchGroupMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload.members;
        state.membersPagination = action.payload.meta?.pagination || state.membersPagination;
      })
      .addCase(fetchGroupMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Üyeler yüklenemedi';
        toast.error(state.error);
      })
      
      // Update member role states
      .addCase(updateMemberRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        state.loading = false;
        // Update in members list
        const index = state.members.findIndex(member => member.user_id === action.payload.userId);
        if (index !== -1) {
          state.members[index].rol = action.payload.role;
        }
        toast.success('Üye rolü başarıyla güncellendi');
      })
      .addCase(updateMemberRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Üye rolü güncellenemedi';
        toast.error(state.error);
      })
      
      // Approve membership states
      .addCase(approveMembership.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveMembership.fulfilled, (state, action) => {
        state.loading = false;
        // Remove member from the list (will be reloaded on next fetch)
        state.members = state.members.filter(member => member.user_id !== action.payload.userId);
        toast.success(action.payload.result.message);
      })
      .addCase(approveMembership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Üyelik isteği işlenemedi';
        toast.error(state.error);
      });
  },
});

export const { clearGroupError, setActiveGroup, setGroupPage, setMembersPage } = groupSlice.actions;

export default groupSlice.reducer;