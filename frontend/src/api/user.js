import api from './index';

const userService = {
  // Kullanıcı bilgilerini getirme
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Kullanıcı adına göre kullanıcı getirme
  getUserByUsername: async (username) => {
    const response = await api.get(`/users/by-username/${username}`);
    return response.data;
  },

  // Profil güncelleme
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  // Hesap silme
  deleteAccount: async () => {
    const response = await api.delete('/users/account');
    return response.data;
  },

  // Kullanıcı forumlarını getirme
  getUserForums: async (userId, page = 1, per_page = 10) => {
    const response = await api.get(`/users/${userId}/forums`, {
      params: { }
    });
    return response.data;
  },

  // Kullanıcı yorumlarını getirme
  getUserComments: async (userId, page = 1, per_page = 10) => {
    const response = await api.get(`/users/${userId}/comments`, {
      params: { page, per_page }
    });
    return response.data;
  },

  // Kullanıcı anketlerini getirme
  getUserPolls: async (userId, page = 1, per_page = 10) => {
    const response = await api.get(`/users/${userId}/polls`, {
      params: { page, per_page }
    });
    return response.data;
  },

  // Kullanıcı gruplarını getirme
  getUserGroups: async (userId) => {
    const response = await api.get(`/users/${userId}/groups`);
    return response.data;
  },

  // Kendi forumları
  getMyForums: async (page = 1, per_page = 10) => {
    const response = await api.get('/users/forums', {
      params: {  }
    });
    return response.data;
  },

  // Kendi yorumları
  getMyComments: async (page = 1, per_page = 10) => {
    const response = await api.get('/users/comments', {
      params: { page, per_page }
    });
    return response.data;
  },

  // Kendi anketleri
  getMyPolls: async (page = 1, per_page = 10) => {
    const response = await api.get('/users/polls', {
      params: { page, per_page }
    });
    return response.data;
  },

  // Kendi grupları
  getMyGroups: async () => {
    const response = await api.get('/users/groups');
    return response.data;
  }
};

export default userService;