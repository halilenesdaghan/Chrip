import api from './index';

const groupService = {
  // Tüm grupları getirme
  getAllGroups: async (page = 1, per_page = 10, search = null, kategoriler = null) => {
    const params = { page, per_page };
    if (search) params.search = search;
    if (kategoriler) params.kategoriler = kategoriler;

    const response = await api.get('/groups', { params });
    return response.data;
  },

  // Belirli bir grubu getirme
  getGroup: async (groupId) => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },

  // Yeni grup oluşturma
  createGroup: async (groupData) => {
    const response = await api.post('/groups', groupData);
    return response.data;
  },

  // Grup güncelleme
  updateGroup: async (groupId, groupData) => {
    const response = await api.put(`/groups/${groupId}`, groupData);
    return response.data;
  },

  // Grup silme
  deleteGroup: async (groupId) => {
    const response = await api.delete(`/groups/${groupId}`);
    return response.data;
  },

  // Gruba katılma
  joinGroup: async (groupId) => {
    const response = await api.post(`/groups/${groupId}/join`);
    return response.data;
  },

  // Gruptan ayrılma
  leaveGroup: async (groupId) => {
    const response = await api.post(`/groups/${groupId}/leave`);
    return response.data;
  },

  // Grup üyelerini getirme
  getGroupMembers: async (groupId, page = 1, per_page = 20, status = null, role = null) => {
    const params = { page, per_page };
    if (status) params.status = status;
    if (role) params.role = role;

    const response = await api.get(`/groups/${groupId}/members`, { params });
    return response.data;
  },

  // Üye rolünü güncelleme
  updateMemberRole: async (groupId, userId, role) => {
    const response = await api.put(`/groups/${groupId}/members/${userId}/role`, {
      role // 'uye', 'moderator', 'yonetici'
    });
    return response.data;
  },

  // Üyelik başvurusunu onaylama/reddetme
  approveMembership: async (groupId, userId, approve) => {
    const response = await api.post(`/groups/${groupId}/members/${userId}/approve`, {
      approve // true veya false
    });
    return response.data;
  }
};

export default groupService;